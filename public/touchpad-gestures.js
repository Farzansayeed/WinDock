/** Pointer-independent gestures; cancellation never generates a click. */
export class TouchpadGestures {
  constructor({ move, scroll, zoom, click, dragging = () => false, now = () => performance.now() }) {
    Object.assign(this, { move, scroll, zoom, click, dragging, now }); this.reset();
  }
  reset() { this.points = new Map(); this.sequence = null; this.pair = null; }
  geometry() {
    const [a, b] = this.points.values();
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, span: Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)) };
  }
  down(id, x, y) {
    if (!this.points.size) this.sequence = { start: this.now(), maximum: 0, distance: 0, frozen: false, cancelled: false };
    this.points.set(id, { x, y, startX: x, startY: y });
    this.sequence.maximum = Math.max(this.sequence.maximum, this.points.size);
    if (this.points.size === 2) {
      const origin = this.geometry();
      this.pair = { origin, previous: origin, anchor: origin.span, mode: null, changed: new Set(), waiting: null };
    }
    if (this.points.size > 2) this.sequence.frozen = true;
  }
  update(id, x, y) {
    const point = this.points.get(id), sequence = this.sequence;
    if (!point || !sequence) return;
    const dx = x - point.x, dy = y - point.y;
    sequence.distance = Math.max(sequence.distance, Math.hypot(x - point.startX, y - point.startY));
    point.x = x; point.y = y;
    if (sequence.frozen) return;
    if (this.points.size === 1) this.move(dx, dy);
    else if (this.points.size === 2 && (dx || dy)) this.pair.changed.add(id);
  }
  // Sample both fingers together once per animation frame. Pointer events arrive
  // separately; classifying each event can mistake a parallel slide for a pinch.
  flush() {
    if (this.points.size !== 2 || this.sequence.frozen || this.dragging()) return false;
    const pair = this.pair, current = this.geometry();
    if (!pair.mode) {
      const travel = Math.hypot(current.x - pair.origin.x, current.y - pair.origin.y);
      const stretch = Math.abs(current.span - pair.origin.span);
      if (travel < 6 && stretch < 10) return false;
      pair.waiting ??= this.now();
      // A stationary finger is a valid pinch, but allow staggered events to catch up.
      if (pair.changed.size < 2 && this.now() - pair.waiting < 48) return true;
      if (stretch >= 10 && stretch > travel * 1.3) pair.mode = "zoom";
      else if (travel >= 6 && travel > stretch * .7) pair.mode = "scroll";
      else return false;
    }
    if (pair.mode === "scroll") {
      const dx = current.x - pair.previous.x, dy = current.y - pair.previous.y;
      if (dx || dy) this.scroll(dx, dy);
    } else {
      const steps = Math.max(-8, Math.min(8, Math.trunc(Math.log(current.span / pair.anchor) / Math.log(1.1))));
      if (steps) { this.zoom(steps); pair.anchor = current.span; }
    }
    pair.previous = current;
    return false;
  }
  up(id, cancelled = false) {
    if (!cancelled) this.flush();
    if (!this.points.delete(id)) return;
    this.sequence.cancelled ||= cancelled;
    if (this.points.size) { this.sequence.frozen = true; return; }
    const s = this.sequence;
    if (!s.cancelled && !this.pair?.mode && s.maximum <= 2 && this.now() - s.start < 300 && s.distance < 8 && !this.dragging()) this.click(s.maximum === 2 ? "right" : "left");
    this.reset();
  }
}
