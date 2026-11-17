#!/usr/bin/env bash
set -euo pipefail
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb logcat -c
adb shell am start -W -n fr.agassin.sprog/.MainActivity
sleep 8
adb shell dumpsys activity activities > /tmp/sprog-activity.txt
rg 'mResumedActivity.*fr.agassin.sprog' /tmp/sprog-activity.txt
adb shell uiautomator dump /sdcard/sprog-window.xml
adb pull /sdcard/sprog-window.xml /tmp/sprog-window.xml
rg 'Programme|Sprog|Séance' /tmp/sprog-window.xml
adb logcat -d -s AndroidRuntime:E > /tmp/sprog-crashes.txt
if rg 'FATAL EXCEPTION' /tmp/sprog-crashes.txt; then exit 1; fi
printf 'Android installation and startup passed.\n'
