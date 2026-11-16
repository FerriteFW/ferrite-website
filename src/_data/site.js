// Site-wide settings and the URL map between the subdomains.
//
// `npm run build` sets ELEVENTY_ENV=production: links between sites are absolute subdomain URLs.
// `npm run serve` is the local preview: the main site and the blog share one server (the blog under /blog/).
// The console and the manual always point at their real addresses (they are built elsewhere).

const production = process.env.ELEVENTY_ENV === "production";

export default {
  production,
  name: "Ferrite",
  description: "Free firmware for the Radtel RT-950 Pro, with its source public.",

  // Where each site lives. `www` and `blog` are prefixes: "" means the root of this server.
  urls: {
    www: production ? "https://ferritefw.dev" : "",
    blog: production ? "https://blog.ferritefw.dev" : "/blog",
    console: "https://console.ferritefw.dev",
    manual: "https://manual.ferritefw.dev",
  },
  // Absolute addresses, for the feed and social tags.
  absolute: {
    www: "https://ferritefw.dev",
    blog: production ? "https://blog.ferritefw.dev" : "http://localhost:8080/blog",
  },

  discord: "https://discord.gg/fYygBVD2Kx",
  // The radio, through Ferrite's Radtel affiliate link. Always say it is an affiliate link where it is used.
  radio:
    "https://www.radtels.com/products/radtel-rt-950-pro-27mhz-tx-rx-10w-walkie-talkie-am-fm-usb-lsb-cw-receive-gps-aprs-wireless-bluetooth-phone-programming-noaa-two-way-radio?ref=FERRITEFW&variant=44669996794064",
  licence: {
    name: "PolyForm Noncommercial License 1.0.0",
    url: "https://polyformproject.org/licenses/noncommercial/1.0.0/",
    holder: "Alex Harvey",
  },

  // Bench & support switches. Each section or line stays hidden until its value is set.
  SUPPORT_URL: "", // the donation link: the Donations section shows once it is set
  CONTACT: "", // the manufacturers' contact (an email address)

  // Releases. Set `released` once 0.9 is out; until then the download page says it isn't out yet.
  release: {
    next: "0.9",
    released: false,
  },
  minisign: {
    id: "5B2C47F45817851B",
    key: "RWQbhRdY9EcsW+Has6GdiIJMPCVPZltho1Lv4lkOpBYls0fxgxZ6Tvai",
  },
};
