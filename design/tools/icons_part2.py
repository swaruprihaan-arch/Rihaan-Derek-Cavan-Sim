# CONTRAIL icon set, part 2: weather, time, instruments, aviation objects.
CLOUD_SMALL = '<path d="M6.5 14h10a3.25 3.25 0 0 0 0-6.5 5 5 0 0 0-9.8.6A2.95 2.95 0 0 0 6.5 14z"></path>'

ICONS = {
    "cloud": (
        '<path d="M6 19.5h11a4 4 0 0 0 0-8 5.6 5.6 0 0 0-11 .5A3.75 3.75 0 0 0 6 19.5z"></path>'
    ),
    "cloud-rain": (
        CLOUD_SMALL
        + '<path d="m8.5 17-1 3.5"></path><path d="m12.5 17-1 3.5"></path><path d="m16.5 17-1 3.5"></path>'
    ),
    "cloud-snow": (
        CLOUD_SMALL
        + '<circle cx="8" cy="17.5" r="0.5"></circle><circle cx="12" cy="17.5" r="0.5"></circle><circle cx="16" cy="17.5" r="0.5"></circle>'
        + '<circle cx="10" cy="21" r="0.5"></circle><circle cx="14" cy="21" r="0.5"></circle>'
    ),
    "cloud-lightning": (
        CLOUD_SMALL
        + '<path d="m13 14-2.5 4h3l-2.5 4"></path>'
    ),
    "wind": (
        '<path d="M3 8h9a2.25 2.25 0 1 0-2.25-2.25"></path>'
        '<path d="M3 12.5h14a2.75 2.75 0 1 0-2.75-2.75"></path>'
        '<path d="M3 17h7.5a2 2 0 1 1-2 2"></path>'
    ),
    "sun": (
        '<circle cx="12" cy="12" r="4"></circle>'
        '<path d="M12 2.5V5"></path><path d="M12 19v2.5"></path>'
        '<path d="M2.5 12H5"></path><path d="M19 12h2.5"></path>'
        '<path d="m5.28 5.28 1.77 1.77"></path><path d="m16.95 16.95 1.77 1.77"></path>'
        '<path d="m5.28 18.72 1.77-1.77"></path><path d="m16.95 7.05 1.77-1.77"></path>'
    ),
    "moon": (
        '<path d="M20.5 13.3A8.5 8.5 0 1 1 10.7 3.5a6.5 6.5 0 0 0 9.8 9.8z"></path>'
    ),
    "sunrise": (
        '<path d="M2.5 21.5h19"></path>'
        '<path d="M17.5 18a5.5 5.5 0 0 0-11 0"></path>'
        '<path d="M2.5 18H5"></path><path d="M19 18h2.5"></path>'
        '<path d="m5.3 11.3 1.4 1.4"></path><path d="m18.7 11.3-1.4 1.4"></path>'
        '<path d="M12 9.5v-6"></path><path d="m9 6.5 3-3 3 3"></path>'
    ),
    "thermometer": (
        '<path d="M14.25 14.5V5a2.25 2.25 0 0 0-4.5 0v9.5a4 4 0 1 0 4.5 0z"></path>'
        '<path d="M12 10v7.5"></path>'
    ),
    "gauge": (
        '<path d="M5.64 18.36A9 9 0 1 1 18.36 18.36"></path>'
        '<path d="m12 12 4.5-5"></path>'
        '<circle cx="12" cy="12" r="1.25"></circle>'
    ),
    "clock": (
        '<circle cx="12" cy="12" r="9.5"></circle>'
        '<path d="M12 7v5l3 2"></path>'
    ),
    "calendar": (
        '<rect x="3" y="4.5" width="18" height="17" rx="2"></rect>'
        '<path d="M3 10h18"></path>'
        '<path d="M8 2.5v4"></path><path d="M16 2.5v4"></path>'
    ),
    "fuel": (
        '<path d="M2.5 21.5h12"></path>'
        '<path d="M4 21.5V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16.5"></path>'
        '<path d="M6.5 10V6.5h4V10"></path>'
        '<path d="M13 11.5h2.5a1.5 1.5 0 0 1 1.5 1.5v4a2 2 0 0 0 4 0V9.5l-2.5-3"></path>'
    ),
    "weight": (
        '<circle cx="12" cy="5" r="2.5"></circle>'
        '<path d="M7 7.5h10l2.5 12a1.5 1.5 0 0 1-1.5 2h-12a1.5 1.5 0 0 1-1.5-2z"></path>'
    ),
    "scale": (
        '<path d="M12 4v17"></path>'
        '<path d="M7.5 21h9"></path>'
        '<path d="M3.5 7.5h17"></path>'
        '<path d="m3 15 2.5-7.5L8 15"></path><path d="M3 15a2.5 2.5 0 0 0 5 0"></path>'
        '<path d="m16 15 2.5-7.5L21 15"></path><path d="M16 15a2.5 2.5 0 0 0 5 0"></path>'
    ),
    "tower": (
        '<path d="M12 2.5v2"></path>'
        '<path d="M4.5 4.5h15v2l-2 3.5h-11l-2-3.5z"></path>'
        '<path d="M9.5 10v11.5"></path><path d="M14.5 10v11.5"></path>'
        '<path d="M5.5 21.5h13"></path>'
    ),
    "runway": (
        '<path d="M3 21.5 8.5 3.5h7l5.5 18z"></path>'
        '<path d="M12 7v2"></path><path d="M12 12v2.5"></path><path d="M12 17.5v2"></path>'
    ),
    "helicopter": (
        '<path d="M2.5 4h19"></path>'
        '<path d="M12 4v3"></path>'
        '<path d="M8 7h3.5c3.3 0 6 2.3 6 5v2.5a1.5 1.5 0 0 1-1.5 1.5H7A3.5 3.5 0 0 1 3.5 12.5v-1A4.5 4.5 0 0 1 8 7z"></path>'
        '<path d="M17.5 11.5h4"></path><path d="M21.5 13.5V9"></path>'
        '<path d="M6.5 19.5h10"></path><path d="M9 16v3.5"></path><path d="M14 16v3.5"></path>'
    ),
    "snowflake": "__SNOWFLAKE__",
    "droplet": (
        '<path d="M12 3c-3.5 4-6.5 8-6.5 11.5a6.5 6.5 0 0 0 13 0C18.5 11 15.5 7 12 3z"></path>'
    ),
    "parachute": (
        '<path d="M3.5 11a8.5 8.5 0 0 1 17 0"></path>'
        '<path d="M3.5 11c1.4 1.4 2.85 1.4 4.25 0s2.85 1.4 4.25 0 2.85 1.4 4.25 0 2.85 1.4 4.25 0"></path>'
        '<path d="m3.5 11 7.5 7.5"></path><path d="M20.5 11 13 18.5"></path>'
        '<circle cx="12" cy="20" r="1.5"></circle>'
    ),
    "anchor": (
        '<circle cx="12" cy="5.5" r="2.75"></circle>'
        '<path d="M12 8.25V21.5"></path>'
        '<path d="M6 12.5H3a9 9 0 0 0 18 0h-3"></path>'
        '<path d="M8.5 10h7"></path>'
    ),
    "plane-takeoff": "__TAKEOFF__",
    "plane-landing": "__LANDING__",
}
