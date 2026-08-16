import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All 11 Chapters starting pages in the 246-page book
export const CHAPTER_START_PAGES = {
  0: 1,   // ভূমিকা — সাতটি ক্লিক (Pages 1-7)
  1: 8,   // অধ্যায় ১ — ই-কমার্স: উৎপত্তি থেকে বৈশ্বিক ব্যবসা (Pages 8-21)
  2: 22,  // অধ্যায় ২ — ব্যবসার মনোবিজ্ঞান: সমস্যা ও সুযোগ খুঁজে বের করা (Pages 22-39)
  3: 40,  // অধ্যায় ৩ — Product Discovery & Winning Product Research (Pages 40-61)
  4: 62,  // অধ্যায় ০৪ — Dropshipping: সম্পূর্ণ Business Model (Pages 62-88)
  5: 89,  // অধ্যায় ০৫ — আপনার E-Commerce Business তৈরি করুন: শূন্য থেকে একটি ব্র্যান্ড (Pages 89-111)
  6: 112, // অধ্যায় ৬ — অর্গানিক মার্কেটিং: টাকা খরচ না করে মানুষের দৃষ্টি আকর্ষণ করুন (Pages 112-134)
  7: 135, // অধ্যায় ০৭ — পেইড মার্কেটিং: প্রথম বিজ্ঞাপন থেকে লাভজনক ক্যাম্পেইন (Pages 135-163)
  8: 164, // অধ্যায় ০৮ — E-Commerce Sales & Conversion Engine (Pages 164-186)
  9: 187, // অধ্যায় ০৯ — ড্রপশিপিং স্টোর থেকে গ্লোবাল ব্র্যান্ড (Pages 187-208)
  10: 209 // অধ্যায় ১০ — বাংলাদেশ থেকে বিশ্ব: একটি স্কেলযোগ্য E-Commerce Empire গড়ে তোলা (Pages 209-246)
};
