type SocialLink = { platform: "instagram" | "facebook"; label: string; url: string | null };
type LocationLink = { provider: "googleMaps" | "waze"; label: string; url: string };

export const footerLinks: { patients: string; social: readonly SocialLink[]; locations: readonly LocationLink[] } = {
  patients: "https://mendaramedical.com/",
  social: [
    { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/mendarahouse/" },
    { platform: "facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61595478870572" },
  ],
  locations: [
    { provider: "googleMaps", label: "Google Maps", url: "https://www.google.com/maps/search/?api=1&query=9.934773374152297%2C-84.11346962427005" },
    { provider: "waze", label: "Waze", url: "https://waze.com/ul?ll=9.934773374152297%2C-84.11346962427005&navigate=yes" },
  ],
};
