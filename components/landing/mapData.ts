import type { FeatureCollection, Point } from "geojson";

export interface ProblemProperties {
  id: string;
  type: "pothole" | "streetlight" | "dumping" | "flooding";
  label: string;
  color: "#6b0f1a";
}

const problems: FeatureCollection<Point, ProblemProperties> = {
  type: "FeatureCollection",
  features: [
    // --- Potholes ---
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5234, 43.4510] },
      properties: { id: "p1", type: "pothole", label: "Deep pothole on King St S", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5192, 43.4635] },
      properties: { id: "p2", type: "pothole", label: "Cracked pavement near Uptown", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5310, 43.4625] },
      properties: { id: "p3", type: "pothole", label: "Pothole at Erb & Caroline", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5145, 43.4580] },
      properties: { id: "p4", type: "pothole", label: "Road damage on Weber St", color: "#6b0f1a" },
    },
    // --- Streetlights ---
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5275, 43.4722] },
      properties: { id: "s1", type: "streetlight", label: "Broken streetlight on Columbia", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5218, 43.4690] },
      properties: { id: "s2", type: "streetlight", label: "Flickering light near Laurel Trail", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5350, 43.4565] },
      properties: { id: "s3", type: "streetlight", label: "Dead light on Westmount Rd", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5160, 43.4750] },
      properties: { id: "s4", type: "streetlight", label: "Outage on University Ave", color: "#6b0f1a" },
    },
    // --- Dumping ---
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5290, 43.4540] },
      properties: { id: "d1", type: "dumping", label: "Illegal dumping behind plaza", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5120, 43.4660] },
      properties: { id: "d2", type: "dumping", label: "Trash pile near Iron Horse Trail", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5380, 43.4680] },
      properties: { id: "d3", type: "dumping", label: "Dumped furniture on Beechwood", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5205, 43.4500] },
      properties: { id: "d4", type: "dumping", label: "Construction debris on Allen St", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5170, 43.4720] },
      properties: { id: "d5", type: "dumping", label: "Bags of waste near Waterloo Park", color: "#6b0f1a" },
    },
    // --- Flooding ---
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5255, 43.4595] },
      properties: { id: "f1", type: "flooding", label: "Storm drain backup on Albert St", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5100, 43.4530] },
      properties: { id: "f2", type: "flooding", label: "Flooded underpass at Homer Watson", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5330, 43.4710] },
      properties: { id: "f3", type: "flooding", label: "Standing water on Lester St", color: "#6b0f1a" },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-80.5185, 43.4480] },
      properties: { id: "f4", type: "flooding", label: "Basement flooding reports on Hazel", color: "#6b0f1a" },
    },
  ],
};

export default problems;
