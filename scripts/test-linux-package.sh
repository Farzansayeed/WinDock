#!/bin/bash
# Disposable container only: installs and removes system packages.
set -euo pipefail
[[ -f /.dockerenv ]] || { echo "Run package tests inside Docker" >&2; exit 1; }
kind=${1:?deb or arch}
if [[ "$kind" = deb ]]; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y --no-install-recommends /packages/WinDock-linux-amd64.deb
elif [[ "$kind" = arch ]]; then
    pacman -Syu --noconfirm
    pacman -U --noconfirm /packages/WinDock-linux-x64.pkg.tar.zst
else
    echo "Unknown package type" >&2
    exit 1
fi
useradd --create-home tester
if windock > /tmp/windock-root.log 2>&1; then
    echo "App must refuse running as root" >&2
    exit 1
fi
grep -q 'without sudo' /tmp/windock-root.log
test -x /usr/lib/windock/node
test -x /usr/lib/windock/windock-input
test -f /usr/share/applications/windock.desktop
grep -q 'TAG+="uaccess"' /usr/lib/udev/rules.d/70-windock-uinput.rules
grep -qx uinput /usr/lib/modules-load.d/windock.conf
runuser -u tester -- /usr/lib/windock/node /tests/test-linux-installed.mjs
settings_hash=$(sha256sum /home/tester/.config/windock/config.json | cut -d ' ' -f1)
# Give a copy a higher package revision to exercise an actual upgrade.
mkdir /tmp/windock-upgrade
if [[ "$kind" = deb ]]; then
    upgraded_version="$(dpkg-query -W -f='${Version}' windock).1"
    dpkg-deb -R /packages/WinDock-linux-amd64.deb /tmp/windock-upgrade
    sed -i "s/^Version: .*/Version: $upgraded_version/" /tmp/windock-upgrade/DEBIAN/control
    dpkg-deb --root-owner-group --build /tmp/windock-upgrade /tmp/windock-upgrade.deb
    apt-get install -y --no-install-recommends /tmp/windock-upgrade.deb
    test "$(dpkg-query -W -f='${Version}' windock)" = "$upgraded_version"
else
    upgraded_version="$(pacman -Q windock | cut -d ' ' -f2).1"
    bsdtar -xf /packages/WinDock-linux-x64.pkg.tar.zst -C /tmp/windock-upgrade
    sed -i "s/^pkgver = .*/pkgver = $upgraded_version/" /tmp/windock-upgrade/.PKGINFO
    bsdtar --zstd -cf /tmp/windock-upgrade.pkg.tar.zst -C /tmp/windock-upgrade .PKGINFO .INSTALL usr
    pacman -U --noconfirm /tmp/windock-upgrade.pkg.tar.zst
    test "$(pacman -Q windock)" = "windock $upgraded_version"
fi
test "$(sha256sum /home/tester/.config/windock/config.json | cut -d ' ' -f1)" = "$settings_hash"
runuser -u tester -- /usr/lib/windock/node /tests/test-linux-installed.mjs
if [[ "$kind" = deb ]]; then
    apt-get purge -y windock
else
    pacman -R --noconfirm windock
fi
test ! -e /usr/bin/windock
test ! -e /usr/lib/windock
test ! -e /usr/share/applications/windock.desktop
test ! -e /usr/lib/udev/rules.d/70-windock-uinput.rules
test ! -e /usr/lib/modules-load.d/windock.conf
test "$(sha256sum /home/tester/.config/windock/config.json | cut -d ' ' -f1)" = "$settings_hash"
echo "Linux $kind install, upgrade and uninstall PASS"
