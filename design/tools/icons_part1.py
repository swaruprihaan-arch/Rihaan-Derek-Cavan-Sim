# CONTRAIL icon set, part 1: navigation, places, settings, hardware.
# Each value is the inner markup of a 24x24 stroke icon (stroke 1.75, round caps/joins).
ICONS = {
    "home": (
        '<path d="M3 11.25 12 3.5l9 7.75"></path>'
        '<path d="M5 9.75V20.5h14V9.75"></path>'
        '<path d="M10 20.5v-6h4v6"></path>'
    ),
    "hangar": (
        '<path d="M3.5 20.5V12.5a8.5 8.5 0 0 1 17 0v8"></path>'
        '<path d="M2.5 20.5h19"></path>'
        '<path d="M8.5 20.5v-6.5h7v6.5"></path>'
        '<path d="M12 14v6.5"></path>'
    ),
    "plane": (
        '<path d="M12 2.5c.9 0 1.5 1.1 1.5 2.5v3.5l8 5v2l-8-2.5V17.5l3 2v1.5l-4.5-1-4.5 1V19.5l3-2V13L2.5 15.5v-2l8-5V5c0-1.4.6-2.5 1.5-2.5z"></path>'
    ),
    "map": (
        '<path d="M2.5 6.5 9 3.5l6 3 6.5-3v14L15 20.5l-6-3-6.5 3z"></path>'
        '<path d="M9 3.5v14"></path>'
        '<path d="M15 6.5v14"></path>'
    ),
    "globe": (
        '<circle cx="12" cy="12" r="9.5"></circle>'
        '<path d="M2.5 12h19"></path>'
        '<path d="M12 2.5a14.5 14.5 0 0 1 3.8 9.5 14.5 14.5 0 0 1-3.8 9.5 14.5 14.5 0 0 1-3.8-9.5A14.5 14.5 0 0 1 12 2.5z"></path>'
    ),
    "compass": (
        '<circle cx="12" cy="12" r="9.5"></circle>'
        '<path d="m16 8-2 6-6 2 2-6z"></path>'
    ),
    "route": (
        '<circle cx="5.5" cy="18.5" r="3"></circle>'
        '<circle cx="18.5" cy="5.5" r="3"></circle>'
        '<path d="M8.5 18.5h6.5a3.25 3.25 0 0 0 0-6.5h-6a3.25 3.25 0 0 1 0-6.5h6.5"></path>'
    ),
    "pin": (
        '<path d="M19.5 10a7.5 7.5 0 0 0-15 0c0 5.5 7.5 11.5 7.5 11.5s7.5-6 7.5-11.5z"></path>'
        '<circle cx="12" cy="10" r="2.75"></circle>'
    ),
    "sliders": (
        '<path d="M3 6h9"></path><path d="M18 6h3"></path><circle cx="15" cy="6" r="2.25"></circle>'
        '<path d="M3 12h3"></path><path d="M12 12h9"></path><circle cx="9" cy="12" r="2.25"></circle>'
        '<path d="M3 18h10"></path><path d="M19 18h2"></path><circle cx="16" cy="18" r="2.25"></circle>'
    ),
    "gamepad": (
        '<path d="M7.5 6.5h9a4.5 4.5 0 0 1 4.5 4.5v3.5a3.25 3.25 0 0 1-5.6 2.25L14 15.25h-4l-1.4 1.5A3.25 3.25 0 0 1 3 14.5V11a4.5 4.5 0 0 1 4.5-4.5z"></path>'
        '<path d="M7.25 10.5v4"></path><path d="M5.25 12.5h4"></path>'
        '<circle cx="15.5" cy="13.25" r="0.75"></circle><circle cx="18.25" cy="10.75" r="0.75"></circle>'
    ),
    "joystick": (
        '<rect x="3.5" y="15.5" width="17" height="5" rx="2"></rect>'
        '<path d="M12 15.5v-7"></path>'
        '<circle cx="12" cy="5.5" r="3"></circle>'
        '<path d="M7 15.5v-2.5"></path>'
    ),
    "monitor": (
        '<rect x="2.5" y="3.5" width="19" height="13" rx="2"></rect>'
        '<path d="M8 21h8"></path>'
        '<path d="M12 16.5V21"></path>'
    ),
    "speaker": (
        '<rect x="5.5" y="2.5" width="13" height="19" rx="2"></rect>'
        '<circle cx="12" cy="14.5" r="3.5"></circle>'
        '<circle cx="12" cy="7" r="1"></circle>'
    ),
    "keyboard": (
        '<rect x="2.5" y="6.5" width="19" height="11" rx="2"></rect>'
        '<path d="M6 10.5h1"></path><path d="M9.5 10.5h1"></path><path d="M13 10.5h1"></path><path d="M16.5 10.5h1"></path>'
        '<path d="M8 14h8"></path>'
    ),
    "mouse": (
        '<rect x="6.5" y="2.5" width="11" height="19" rx="5.5"></rect>'
        '<path d="M12 6.5v3.5"></path>'
    ),
    "cog": "__COG__",
    "camera": (
        '<path d="M21.5 18.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h3l1.75-2.5h5.5l1.75 2.5h3a2 2 0 0 1 2 2z"></path>'
        '<circle cx="12" cy="13" r="3.5"></circle>'
    ),
    "headset": (
        '<path d="M5.5 14.5V11a6.5 6.5 0 0 1 13 0v3.5"></path>'
        '<rect x="3.5" y="14.5" width="4" height="5.5" rx="1.5"></rect>'
        '<rect x="16.5" y="14.5" width="4" height="5.5" rx="1.5"></rect>'
        '<path d="M18.5 20v.5a1.5 1.5 0 0 1-1.5 1.5h-4"></path>'
    ),
    "radio": (
        '<rect x="6.5" y="7.5" width="11" height="14" rx="1.5"></rect>'
        '<path d="M9.5 7.5v-5"></path>'
        '<path d="M9.5 10.5h5v3h-5z"></path>'
        '<path d="M9.5 17h1"></path><path d="M13.5 17h1"></path>'
    ),
    "checklist": (
        '<path d="M16 4.5h2a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V6A1.5 1.5 0 0 1 6 4.5h2"></path>'
        '<rect x="8" y="2.5" width="8" height="4" rx="1"></rect>'
        '<path d="m8.5 12.5 2 2 4.5-4.5"></path>'
        '<path d="M8.5 17h7"></path>'
    ),
    "wrench": (
        '<path d="M20.5 6.5l-3 3-3-3 3-3a5 5 0 0 0-6.4 6.4L3.9 17.1a2 2 0 0 0 2.9 2.9l7.2-7.2a5 5 0 0 0 6.5-6.3z"></path>'
    ),
}
