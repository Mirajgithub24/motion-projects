import type { Camera, Cue } from "./types";

// The edit, driven by the voiceover (projects/percel-video/transcript.json).
// All times are VOICEOVER seconds; the picture starts LEAD_IN (0.5 s) earlier.
// Shot starts sit in measured pauses (ffmpeg silencedetect), never mid-word.
// Cue times are word starts from the transcript.
//
// One camera move per shot. A design shown as several shots keeps one build.
// A cue at NEVER keeps that element hidden (its fact is shown by another scene).

export type Shot = {
  design: string;
  start: number;
  camera: Camera;
  cues?: Cue[];
  // first shot of each scene: what goes in the Part B table
  scene?: { section: string; cueWord: string; text: string; camera: string };
};

export const VOICEOVER_SECONDS = 296.124;
export const TOTAL_SECONDS = VOICEOVER_SECONDS + 0.5 + 1.5;
const NEVER = 9999;

const push = (focus: [number, number] = [0.5, 0.5], amount = 0.06): Camera => ({ type: "push", focus, amount });
const pull = (focus: [number, number] = [0.5, 0.5], amount = 0.12): Camera => ({ type: "pull", focus, amount });
const panL = (amount = 0.05): Camera => ({ type: "panL", amount });
const panR = (amount = 0.05): Camera => ({ type: "panR", amount });
const still: Camera = { type: "static" };

export const SHOTS: Shot[] = [
  // ---------------- 1 · Hook ----------------
  {
    design: "S1A", start: 0, camera: push([0.5, 0.42]),
    cues: [{ target: "S1A_Door_Mid_Grill", at: 2.98, beatOnly: true }],
    scene: { section: "Hook", cueWord: "টোকা (2.98)", text: "(door 4-বি, শান্তি নীড়; the door jolts on the knock)", camera: "Push-in" },
  },
  {
    design: "S1B", start: 4.15, camera: push([0.62, 0.45], 0.05),
    cues: [
      { target: "S1B_Knock_FX_Impact", at: 4.4, beat: true },
      { target: "S1B_Knock_FX_Caption", at: 4.5, beat: true },
      { target: "S1B_Knock_FX_Impact", at: 7.15, beatOnly: true },
      { target: "S1B_Knock_FX_Caption", at: 7.69, beatOnly: true },
    ],
    scene: { section: "Hook", cueWord: "ভাই, আপনার পার্সেল / এমন টোকা (4.4 / 7.15)", text: "ঠক ঠক", camera: "Push-in" },
  },
  {
    design: "S1C", start: 7.39, camera: pull([0.5, 0.6]),
    cues: [
      { target: "S1C_Counter_Label", at: 7.6 },
      // counts from "আজ সারা দিনে" and lands 7,50,000 on "সাড়ে সাত লাখ"
      { target: "S1C_Counter_Number", at: 7.75, hero: true, count: { from: 1, to: 750000, frames: 45 } },
      { target: "S1C_Counter_Steps", at: 9.6 },
    ],
    scene: { section: "Hook", cueWord: "সাড়ে সাত লাখ (8.81)", text: "7,50,000 প্রতিদিনের পার্সেল", camera: "Pull-out" },
  },
  // ---------------- 2 · The question / title ----------------
  {
    design: "Main", start: 10.6, camera: push([0.55, 0.55], 0.05),
    cues: [
      { target: "text:পার্সেলের পেছনের মানুষ", at: 14.74, hero: true, beat: true },
      { target: "text:The People Behind the Parcel", at: 15.2 },
    ],
    scene: { section: "Question / title", cueWord: "মানুষটা (14.74)", text: "পার্সেলের পেছনের মানুষ · The People Behind the Parcel", camera: "Push-in → pan → pull-out (3 shots)" },
  },
  { design: "Main", start: 14.06, camera: panR(0.04) },
  { design: "Main", start: 18.52, camera: pull([0.5, 0.5], 0.1), cues: [{ target: "SF_Rahim_Bike", at: 18.88, beatOnly: true }] },
  // ---------------- 3 · A parcel's journey ----------------
  {
    design: "S2A", start: 22.15, camera: push([0.62, 0.45]),
    cues: [
      { target: "S2A_Studio_Mid_RingLight", at: 24.0, beatOnly: true },
      { target: "S2A_Studio_Mid_SareeRack", at: 24.68, beatOnly: true },
    ],
    scene: { section: "Journey", cueWord: "ফেসবুকে / শাড়ি (24.00 / 24.68)", text: "(Nusrat's home studio, Barishal)", camera: "Push-in" },
  },
  {
    design: "S2B", start: 25.94, camera: panR(0.04),
    cues: [
      { target: "S2B_App_Callout_Seller", at: 26.1, hero: true },
      { target: "S2B_App_Callout_COD", at: 29.08, count: { from: 0, to: 1850 } },
      { target: "S2B_App_Phone", at: 30.16, beatOnly: true },
    ],
    scene: { section: "Journey", cueWord: "অর্ডার এলে / মার্চেন্ট প্যানেলে / বুকিং (26.1 / 29.08 / 30.16)", text: "অর্ডার বুক করা হচ্ছে · ৳1,850", camera: "Lateral pan" },
  },
  {
    design: "S2D", start: 30.99, camera: panL(0.05),
    cues: [{ target: "S2D_Hub_FG_Trolley", at: 33.27, beatOnly: true }],
    scene: { section: "Journey", cueWord: "কাছের হাবে (33.27)", text: "(local hub: রুট কোড board)", camera: "Lateral pan" },
  },
  {
    design: "S2E", start: 33.77, camera: pull([0.5, 0.6], 0.1),
    scene: { section: "Journey", cueWord: "সর্টিং সেন্টারে (34.41)", text: "(sorting center: cages for 8 divisions)", camera: "Pull-out" },
  },
  // ---------------- 4 · Last mile and the money ----------------
  {
    design: "S2H", start: 37.42, camera: push([0.42, 0.55]),
    cues: [
      { target: "S2H_Parcel", at: 41.98, beatOnly: true },
      { target: "S2H_Cash", at: 43.34, beatOnly: true },
    ],
    scene: { section: "Last mile", cueWord: "হাতে দেন / টাকা নেন (41.98 / 43.34)", text: "(handover: parcel out, cash in)", camera: "Push-in → pull-out" },
  },
  { design: "S2H", start: 42.61, camera: pull([0.45, 0.55], 0.08) },
  {
    design: "S2I", start: 48.68, camera: push([0.45, 0.5], 0.05),
    cues: [
      { target: "S2I_Title", at: 48.8, hero: true },
      { target: "S2I_Node_Cash", at: 49.23, count: { from: 0, to: 1850 } },
      { target: "S2I_Deduct_DeliveryCharge", at: 49.75, beat: true },
      { target: "S2I_Deduct_COD", at: 50.91, beat: true },
      { target: "S2I_Node_CourierWallet", at: 52.73 },
      { target: "S2I_Node_SellerWallet", at: 54.49, beat: true },
      { target: "S2I_Equation", at: 54.95 },
    ],
    scene: { section: "Money flow", cueWord: "delivery charge / 1% COD / seller (49.75 / 50.91 / 54.49)", text: "টাকা কোথায় যায়? ৳1,850 − ৳70 − ৳18.50 = ৳1,761.50", camera: "Push-in → pan" },
  },
  { design: "S2I", start: 51.3, camera: panR(0.03) },
  {
    design: "S2J", start: 55.56, camera: pull([0.6, 0.5], 0.1),
    cues: [{ target: "S2J_Title", at: 55.7, hero: true }, { target: "S2J_Map_Pins", at: 58.64, beatOnly: true }],
    scene: { section: "Money flow", cueWord: "অর্থাৎ / চলমান ব্যাংক (55.56 / 58.64)", text: "একটি পার্সেলের যাত্রা", camera: "Pull-out" },
  },
  // ---------------- 5 · The courier business ----------------
  {
    design: "S3B", start: 60.74, camera: pull([0.5, 0.3], 0.1),
    cues: [
      { target: "S3B_Number_700", at: 63.46, hero: true, count: { from: 0, to: 700 } },
      { target: "S3B_Number_114", at: 67.36, hero: true, beat: true, count: { from: 0, to: 114 } },
    ],
    scene: { section: "Couriers", cueWord: "সাতশোর বেশি / একশো চোদ্দ (63.46 / 67.36)", text: "700+ কুরিয়ার প্রতিষ্ঠান vs 114 লাইসেন্সপ্রাপ্ত", camera: "Pull-out → push-in" },
  },
  { design: "S3B", start: 65.67, camera: push([0.65, 0.3], 0.05) },
  {
    design: "S3A", start: 68.62, camera: push([0.65, 0.5]),
    cues: [{ target: "S3A_Text", at: 68.8, hero: true }, { target: "S3A_HubDots", at: 71.6, beatOnly: true }],
    scene: { section: "Couriers", cueWord: "এর মধ্যে / পাঠাও (68.62 / 71.60)", text: "দেশজুড়ে কুরিয়ার হাব", camera: "Push-in → pan" },
  },
  { design: "S3A", start: 71.8, camera: panL(0.03) },
  {
    design: "S3C", start: 77.2, camera: push([0.45, 0.5]),
    cues: [
      { target: "S3C_Title", at: 77.3, hero: true },
      { target: "S3C_Number_300", at: 78.85, beat: true, count: { from: 0, to: 300 } },
      { target: "S3C_Number_8", at: 79.89, beat: true },
    ],
    scene: { section: "Couriers", cueWord: "তিনশো হাব / আটটি (78.85 / 79.89)", text: "হাবের জাল · 300 স্থানীয় হাব · 8 আঞ্চলিক সর্টিং সেন্টার", camera: "Push-in" },
  },
  {
    design: "S3D", start: 81.88, camera: pull([0.5, 0.5], 0.1),
    cues: [
      { target: "S3D_Eq_Row1", at: 84.15, count: { from: 0, to: 750000 } },
      { target: "S3D_Display_Line1", at: 93.96, beat: true },
      { target: "S3D_Display_Line2", at: 95.94, beat: true },
      { target: "S3D_Eq_Row2", at: 95.94, hero: true, beat: true },
      { target: "S3D_Eq_Arrow", at: 97.17 },
      { target: "S3D_Eq_Row3", at: 97.75, hero: true, beat: true },
    ],
    scene: { section: "Daily math", cueWord: "সাড়ে সাত লাখ / গুণ আশি / ছয় কোটি / দুই হাজার কোটি (84.15 / 93.96 / 95.94 / 97.75)", text: "7,50,000 × ৳80 = ৳6 crore/day · ৳2,190 crore/year", camera: "Pull-out → push-in → pan → pull-out (4 shots)" },
  },
  { design: "S3D", start: 86.03, camera: push([0.3, 0.5], 0.05) },
  { design: "S3D", start: 91.01, camera: panR(0.03) },
  { design: "S3D", start: 95.11, camera: pull([0.6, 0.5], 0.08) },
  {
    design: "S3E", start: 100.19, camera: pull([0.55, 0.7], 0.12),
    cues: [
      { target: "text:7,50,000", at: 100.4, hero: true },
      { target: "text:one rider", at: 108.57, beat: true },
      { target: "S3E_Rider", at: 109.03, beatOnly: true },
    ],
    scene: { section: "Daily math", cueWord: "শুধু ডেলিভারি ফি / রাইডারের আয় (100.59 / 108.57)", text: "7,50,000 পার্সেল, প্রতিদিন · one rider", camera: "Pull-out → push to the rider → hold (3 shots)" },
  },
  { design: "S3E", start: 105.57, camera: push([0.24, 0.8], 0.1) },
  { design: "S3E", start: 110.27, camera: push([0.3, 0.75], 0.04) },
  // ---------------- 6 · The rider's share ----------------
  {
    design: "S4C", start: 114.54, camera: push([0.3, 0.45], 0.05),
    cues: [
      { target: "S4C_Token_Rate", at: 120.5, hero: true, beat: true },
      { target: "S4C_Caption_Rate", at: 120.98 },
      { target: "S4C_Caption_Parcels", at: 122.24, beat: true },
      { target: "S4C_Op_Times", at: 124.66 },
      // the ৳450 result and the 26 days are shown by S4F and S4B when they are spoken
      { target: "S4C_Op_Equals", at: NEVER },
      { target: "S4C_Result_Card", at: NEVER },
      { target: "S4C_Divider", at: NEVER },
      { target: "S4C_Days_Label", at: NEVER },
      { target: "S4C_Days_Strip", at: NEVER },
      { target: "S4C_Days_Caption", at: NEVER },
    ],
    scene: { section: "Rider's share", cueWord: "পনেরো টাকা / তিরিশটি / গুণ (120.50 / 122.24 / 124.66)", text: "30 parcels × ৳15 per parcel", camera: "Push-in → pan" },
  },
  { design: "S4C", start: 119.57, camera: panR(0.04) },
  {
    design: "S4F", start: 124.43, camera: push([0.3, 0.45], 0.06),
    cues: [
      { target: "text:দিনের শেষে, হাতে যা থাকে", at: 124.6, hero: true },
      { target: "text:৳450", at: 126.3, hero: true, beat: true, count: { from: 0, to: 450 } },
      { target: "text:৩০ পার্সেল × ৳15", at: 126.64 },
    ],
    scene: { section: "Rider's share", cueWord: "৪৫০ টাকা (126.30)", text: "দিনের শেষে, হাতে যা থাকে ৳450", camera: "Push-in" },
  },
  {
    design: "S4B", start: 127.69, camera: push([0.45, 0.5], 0.05),
    cues: [
      { target: "S4B_Title", at: 127.8, hero: true },
      { target: "S4B_Label_Commission", at: 129.32, count: { from: 0, to: 11700 } },
      { target: "text:26 days × ৳450", at: 128.08 },
      { target: "S4B_Label_Fixed", at: 131.54, beat: true },
      { target: "S4B_Total_Card", at: 133.21, hero: true },
      { target: "S4B_Total_Number", at: 133.21, beat: true },
    ],
    scene: { section: "Rider's share", cueWord: "১১,৭০০ / ৫,০০০ / ১৬,৭০০ (129.32 / 131.54 / 133.21)", text: "What a rider takes home · ≈ ৳16,700", camera: "Push-in → pull-out" },
  },
  { design: "S4B", start: 132.42, camera: pull([0.6, 0.5], 0.08) },
  {
    design: "S4A", start: 134.97, camera: push([0.3, 0.45], 0.05),
    cues: [
      { target: "S4A_Title", at: 135.1, hero: true },
      { target: "S4A_Card_Whole_Numeral", at: 136.49, beat: true },
      { target: "S4A_Label_Rider", at: 139.37, hero: true, beat: true },
      { target: "S4A_Callout_Rider", at: 140.49, beat: true },
    ],
    scene: { section: "Rider's share", cueWord: "৭০ টাকার মধ্যে / ১৫ টাকা / পাঁচ ভাগের এক ভাগ (136.49 / 139.37 / 140.49)", text: "Where does ৳70 go? · Rider ৳15", camera: "Push-in → push to the rider slice" },
  },
  { design: "S4A", start: 139.52, camera: push([0.82, 0.4], 0.06) },
  {
    design: "S4D", start: 142.26, camera: push([0.35, 0.5], 0.05),
    cues: [
      { target: "text:সফলতা কমলে, কমিশনও কমে", at: 144.61, hero: true },
      { target: "text:95% ৳16", at: 148.83, beat: true },
      { target: "S4D_Step_95", at: 151.87, beatOnly: true },
      { target: "text:90% ৳11", at: 152.72, beat: true },
      { target: "S4D_DropArrows", at: 153.1 },
      { target: "text:≤85% ৳7", at: 154.74, beat: true },
      { target: "S4D_Step_85", at: 156.76, beatOnly: true },
    ],
    scene: { section: "Commission", cueWord: "কমিশন / 95% / 90% / 85% (144.61 / 148.83 / 152.72 / 154.74)", text: "সফলতা কমলে, কমিশনও কমে · 95% ৳16 · 90% ৳11 · ≤85% ৳7", camera: "Push-in → pan → pan (3 shots)" },
  },
  { design: "S4D", start: 147.01, camera: panR(0.04) },
  { design: "S4D", start: 152.71, camera: panR(0.04) },
  {
    design: "S4E", start: 157.8, camera: push([0.5, 0.5], 0.05),
    cues: [
      { target: "text:রিং হচ্ছে", at: 159.0, beat: true },
      { target: "text:ইনকামিং কল", at: 159.62 },
    ],
    scene: { section: "Commission", cueWord: "ফোন না ধরলে (159.00)", text: "No answer · কল ধরছে না", camera: "Push-in" },
  },
  // ---------------- 7 · Five years ----------------
  {
    design: "S5A", start: 163.3, camera: panR(0.04),
    cues: [
      { target: "S5A_Year_2020", at: 163.31, beat: true },
      { target: "S5A_Title", at: 163.5, hero: true },
    ],
    scene: { section: "Last five years", cueWord: "২০২০ (163.31)", text: "উত্থান, পতন, ঘুরে দাঁড়ানো", camera: "Lateral pan" },
  },
  {
    design: "S5B", start: 167.89, camera: push([0.6, 0.4], 0.06),
    cues: [{ target: "text:+166%", at: 167.95, hero: true, beat: true, count: { from: 0, to: 166 } }],
    scene: { section: "Last five years", cueWord: "একশো ছেষট্টি (167.86)", text: "2020 লকডাউন · +166%", camera: "Push-in" },
  },
  {
    design: "S5C", start: 172.63, camera: pull([0.5, 0.45], 0.1),
    cues: [{ target: "text:2021 আস্থার সংকট", at: 172.75, hero: true }, { target: "S5C_Shield_Crack", at: 173.64, beatOnly: true }],
    scene: { section: "Last five years", cueWord: "আস্থায় বড় ধাক্কা (172.63)", text: "2021 আস্থার সংকট", camera: "Pull-out" },
  },
  {
    design: "S5D", start: 177.14, camera: push([0.6, 0.35], 0.05),
    cues: [
      { target: "S5D_Number_95", at: 179.22, hero: true, beat: true },
      { target: "S5D_Label_COD", at: 180.98 },
    ],
    scene: { section: "Last five years", cueWord: "৯৫ শতাংশের বেশি (179.22)", text: ">95% COD ক্যাশ অন ডেলিভারি", camera: "Push-in" },
  },
  {
    design: "S5E", start: 182.38, camera: panR(0.04),
    cues: [
      { target: "text:নগদ টাকা এখন ব্যাংকিং চ্যানেলে", at: 182.5, hero: true },
      { target: "text:ব্যাংক", at: 182.92, beat: true },
      { target: "text:ব্যাংকিং চ্যানেল", at: 185.92, beat: true },
    ],
    scene: { section: "Last five years", cueWord: "বাংলাদেশ ব্যাংক / ব্যাংকিং চ্যানেলে (182.92 / 185.92)", text: "নগদ টাকা এখন ব্যাংকিং চ্যানেলে", camera: "Lateral pan" },
  },
  {
    design: "S5F", start: 187.04, camera: push([0.5, 0.45], 0.05),
    cues: [
      { target: "text:প্রতিযোগিতার ঝড়", at: 187.68, hero: true },
      { target: "text:CLOSED", at: 191.08, beat: true },
      { target: "text:SHRINKING", at: 193.0, beat: true },
      { target: "text:GROWING", at: 193.2, beat: true },
    ],
    scene: { section: "Competition", cueWord: "প্রতিযোগিতার / বন্ধ / ছোট (187.68 / 191.08 / 193.00)", text: "প্রতিযোগিতার ঝড় · CLOSED · SHRINKING · GROWING", camera: "Push-in → pan" },
  },
  { design: "S5F", start: 190.58, camera: panR(0.04) },
  {
    design: "S5G", start: 193.81, camera: push([0.25, 0.55], 0.05),
    cues: [
      { target: "S5G_Title", at: 193.95, hero: true },
      { target: "text:2016", at: 194.4, beat: true },
      { target: "text:5 জন রাইডার", at: 196.0, beat: true },
      { target: "S5G_Crowd", at: 198.02 },
      { target: "S5G_Label_Today", at: 199.34, hero: true, beat: true },
    ],
    scene: { section: "Competition", cueWord: "২০১৬ / পাঁচ জন / স্টেডফাস্ট (194.40 / 196.00 / 198.02)", text: "পাঁচজন থেকে হাজার হাজার · 5 → Thousands", camera: "Push-in → pull-out" },
  },
  { design: "S5G", start: 196.21, camera: pull([0.7, 0.55], 0.1) },
  {
    design: "S5H", start: 201.34, camera: push([0.3, 0.5], 0.05),
    cues: [
      { target: "text:পার্সেল যাচ্ছে ঢাকার বাইরে", at: 201.58, hero: true },
      { target: "S5H_Map", at: 202.9, beatOnly: true },
      { target: "text:2/3 ঢাকার বাইরে", at: 207.22, hero: true, beat: true },
      { target: "text:1/3 ঢাকায়", at: 207.9 },
      { target: "text:20 dots leave Dhaka", at: 208.34 },
    ],
    scene: { section: "Competition", cueWord: "পাঠাও / দুই তৃতীয়াংশ (201.58 / 207.22)", text: "পার্সেল যাচ্ছে ঢাকার বাইরে · 2/3 ঢাকার বাইরে", camera: "Push-in → pan" },
  },
  { design: "S5H", start: 204.37, camera: panR(0.03) },
  {
    design: "S2Gv", start: 209.65, camera: push([0.62, 0.55], 0.06),
    scene: { section: "Competition", cueWord: "গ্রামই এখন বড় বাজার (211.35)", text: "(village road; design has no on-screen text)", camera: "Push-in" },
  },
  // ---------------- 8 · The next five years ----------------
  {
    design: "S6A", start: 214.22, camera: panR(0.05),
    cues: [{ target: "text:2030", at: 217.15, hero: true, beat: true }],
    scene: { section: "2030", cueWord: "২০৩০ (217.15)", text: "2030", camera: "Lateral pan → push-in" },
  },
  { design: "S6A", start: 218.79, camera: push([0.4, 0.6], 0.05) },
  {
    design: "S6B", start: 222.62, camera: push([0.4, 0.55], 0.05),
    cues: [
      { target: "text:প্রতিদিনের পার্সেল", at: 222.84 },
      { target: "text:~7.5 lakh per day", at: 224.04, beat: true },
      { target: "text:2025", at: 224.3 },
      { target: "text:~15 lakh per day", at: 226.1, hero: true, beat: true },
      { target: "text:2030", at: 226.36 },
      { target: "text:Who will carry the extra 7", at: 228.07, hero: true },
      { target: "text:+7.5 lakh", at: 229.37, beat: true },
    ],
    scene: { section: "2030", cueWord: "৭.৫ লাখ / ১৫ লাখ / প্রশ্ন (224.04 / 226.10 / 228.07)", text: "~7.5 lakh → ~15 lakh · Who will carry the extra 7.5 lakh?", camera: "Push-in → pan" },
  },
  { design: "S6B", start: 227.61, camera: panR(0.04), cues: [{ target: "S6B_QuestionMarks", at: 230.51, beatOnly: true }] },
  {
    design: "S6C", start: 231.89, camera: push([0.5, 0.3], 0.03),
    cues: [
      { target: "text:Three pillars", at: 232.12, hero: true, beat: true },
      { target: "text:01 Digital payments", at: 236.95, hero: true, beat: true },
      { target: "text:02 Data and automation", at: 242.98, hero: true, beat: true },
      { target: "text:03 Rider rights", at: 248.41, hero: true, beat: true },
    ],
    scene: { section: "What changes", cueWord: "তিনটি পরিবর্তন / ডিজিটাল পেমেন্ট / ডেটা / রাইডারের অধিকার (232.12 / 236.95 / 242.98 / 248.41)", text: "Three pillars · Digital payments · Data and automation · Rider rights", camera: "Push-in on each pillar in turn (5 shots)" },
  },
  { design: "S6C", start: 234.78, camera: push([0.17, 0.55], 0.08) },
  { design: "S6C", start: 240.06, camera: panR(0.04) },
  { design: "S6C", start: 243.25, camera: push([0.5, 0.55], 0.08) },
  { design: "S6C", start: 247.01, camera: push([0.83, 0.55], 0.08) },
  {
    design: "S6D", start: 250.45, camera: pull([0.5, 0.35], 0.12),
    cues: [
      { target: "text:1 million+", at: 251.27, hero: true, beat: true },
      { target: "text:১০ লাখ+ গিগ কর্মী", at: 251.55 },
    ],
    scene: { section: "What changes", cueWord: "দশ লাখেরও বেশি (251.27)", text: "1 million+ · ১০ লাখ+ গিগ কর্মী", camera: "Pull-out" },
  },
  {
    design: "S6E", start: 253.6, camera: push([0.7, 0.45], 0.05),
    cues: [
      { target: "text:Labour reform", at: 254.31, hero: true },
      { target: "text:শ্রম সংস্কার", at: 254.55 },
      { target: "text:রাইডারও একজন শ্রমিক", at: 256.59 },
      { target: "S6E_Stamp", at: 257.47, beat: true },
      { target: "S6E_Check", at: 259.19, beat: true },
    ],
    scene: { section: "What changes", cueWord: "শ্রম সংস্কার / শ্রমিক / সুপারিশ (254.31 / 256.59 / 259.19)", text: "Labour reform · শ্রম সংস্কার · রাইডারও একজন শ্রমিক", camera: "Push-in → pan → pull-out (3 shots)" },
  },
  { design: "S6E", start: 258.16, camera: panL(0.03) },
  { design: "S6E", start: 262.69, camera: pull([0.5, 0.5], 0.08) },
  // ---------------- 9 · Closing ----------------
  {
    design: "S7A", start: 265.5, camera: pull([0.5, 0.5], 0.12),
    scene: { section: "Closing", cueWord: "এই খাত (265.28)", text: "(aerial Dhaka at dusk; no on-screen text)", camera: "Pull-out → pan" },
  },
  { design: "S7A", start: 269.39, camera: panR(0.04) },
  {
    design: "S2G", start: 275.12, camera: panR(0.04),
    cues: [{ target: "S2G_Town_Vehicles", at: 280.11, beatOnly: true }],
    scene: { section: "Closing", cueWord: "মোটরসাইকেলে, সাইকেলে (279.21 / 280.11)", text: "(district-town street: cargo cycle, CNG)", camera: "Lateral pan → push-in" },
  },
  { design: "S2G", start: 277.95, camera: push([0.3, 0.65], 0.06) },
  {
    design: "S7B", start: 282.56, camera: push([0.5, 0.5], 0.05),
    cues: [{ target: "S7B_SpeechBubble", at: 287.38, hero: true, beat: true }],
    scene: { section: "Closing", cueWord: "ধন্যবাদ (287.38)", text: "ধন্যবাদ, ভাই! · Thank you, brother!", camera: "Push-in → push to the bubble" },
  },
  { design: "S7B", start: 285.77, camera: push([0.62, 0.4], 0.05) },
  {
    design: "S7C", start: 288.93, camera: push([0.45, 0.45], 0.06),
    scene: { section: "Closing", cueWord: "পার্সেলের পেছনে (290.62)", text: "(Rahim close-up in the rain)", camera: "Slow push-in" },
  },
  {
    design: "S7D", start: 293.89, camera: still,
    cues: [
      { target: "text:পার্সেলের পেছনের মানুষ", at: 294.95, hero: true },
      { target: "text:The People Behind the Parcel", at: 295.25 },
      { target: "S7D_Actions", at: 295.55 },
    ],
    scene: { section: "Closing", cueWord: "একজন মানুষ (294.95)", text: "পার্সেলের পেছনের মানুষ · ফলো করুন / আপনার মতামত কমেন্টে জানান", camera: "Locked off: title holds still" },
  },
];
