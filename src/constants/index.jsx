import { BotMessageSquare } from "lucide-react";
import { BatteryCharging } from "lucide-react";
import { Fingerprint } from "lucide-react";
import { ShieldHalf } from "lucide-react";
import { PlugZap } from "lucide-react";
import { GlobeLock } from "lucide-react";

import user1 from "../assets/profile-pictures/user1.jpg";
import user2 from "../assets/profile-pictures/user2.jpg";
import user3 from "../assets/profile-pictures/user3.jpg";
import user4 from "../assets/profile-pictures/user4.jpg";
import user5 from "../assets/profile-pictures/user5.jpg";
import user6 from "../assets/profile-pictures/user6.jpg";

export const navItems = [
  { label: "Features", href: "#" },
  { label: "Gallery", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Testimonials", href: "#" },
];

export const testimonials = [
  {
    user: "John Doe",
    company: "Pixel Studios",
    image: user1,
    text: "Inkspire's animation tools transformed our design process. The intuitive interface and powerful features helped us bring our creative visions to life seamlessly.",
  },
  {
    user: "Jane Smith",
    company: "Motion Masters",
    image: user2,
    text: "The platform's ease of use and rich feature set allowed us to quickly animate our concepts. The customer support is exceptional, and we couldn't be happier with the results.",
  },
  {
    user: "David Johnson",
    company: "Creative Cartoons",
    image: user3,
    text: "Inkspire has been a game-changer for our animation workflow. The collaboration tools allowed our team to work efficiently and effectively, creating stunning animations.",
  },
  {
    user: "Ronee Brown",
    company: "Artistic Creations",
    image: user4,
    text: "This platform took our 2D animation projects to the next level. We were able to iterate quickly and refine our work, delivering high-quality animations faster than ever.",
  },
  {
    user: "Michael Wilson",
    company: "Animation Studio X",
    image: user5,
    text: "The real-time preview feature is amazing. We could see our animations evolve instantly, which sped up the design process significantly.",
  },
  {
    user: "Emily Davis",
    company: "Dynamic Animations",
    image: user6,
    text: "Inkspire's platform is not only intuitive but also packed with tools that let us create unique animations that truly stand out. We love using it for our projects.",
  },
];

export const features = [
  {
    icon: <BotMessageSquare />,
    text: "Timeline Editor",
    description:
      "Easily create and adjust animations with our intuitive timeline editor, giving you full control over timing and sequence.",
  },
  {
    icon: <Fingerprint />,
    text: "Customizable Animation Styles",
    description:
      "Bring your creative vision to life with various animation styles, from traditional frame-by-frame animation to more complex motion graphics.",
  },
  {
    icon: <ShieldHalf />,
    text: "Built-in Templates",
    description:
      "Jumpstart your animation projects with pre-built templates for different animation styles, perfect for both beginners and pros.",
  },
  {
    icon: <BatteryCharging />,
    text: "Real-Time Preview",
    description:
      "Preview your animations in real-time as you make changes, giving you instant feedback to fine-tune every movement.",
  },
  {
    icon: <PlugZap />,
    text: "Collaboration Tools",
    description:
      "Collaborate with your team in real-time, sharing and refining your animation projects seamlessly, all within the platform.",
  },
  {
    icon: <GlobeLock />,
    text: "Asset Library",
    description:
      "Access a rich library of animation assets, including characters, backgrounds, and props, to enhance your projects.",
  },
];

export const checklistItems = [
  {
    title: "Vector-Based Tools",
    description:
      "Create scalable vector animations that retain quality at any resolution.",
  },
  {
    title: "Onion Skinning",
    description:
      "Utilize onion skinning to see your previous and next frames, helping you craft smooth, realistic animations.",
  },
  {
    title: "Export Animations",
    description:
      "Export your animations in various formats like GIF, MP4, or web-ready files to share with your audience.",
  },
  {
    title: "Quick Preview",
    description:
      "Instantly preview your animations within the platform to see how they flow before finalizing.",
  },
];

export const pricingOptions = [
  {
    title: "Free",
    price: "$0",
    features: [
      "Basic timeline editor",
      "500MB Cloud Storage",
      "Access to basic templates",
      "Standard export options",
    ],
  },
  {
    title: "Pro",
    price: "$15",
    features: [
      "Advanced timeline editor",
      "2GB Cloud Storage",
      "Full access to all templates",
      "Real-time collaboration",
      "Custom export options",
    ],
  },
  {
    title: "Enterprise",
    price: "$50",
    features: [
      "Full-featured timeline editor",
      "10GB Cloud Storage",
      "Premium asset library",
      "Advanced collaboration tools",
      "Priority customer support",
      "Dedicated account manager",
    ],
  },
];

export const resourcesLinks = [
  { href: "#", text: "Getting Started" },
  { href: "#", text: "Documentation" },
  { href: "#", text: "Tutorials" },
  { href: "#", text: "Animation Techniques" },
  { href: "#", text: "Community Forums" },
];

export const platformLinks = [
  { href: "#", text: "Features" },
  { href: "#", text: "Supported Devices" },
  { href: "#", text: "System Requirements" },
  { href: "#", text: "Downloads" },
  { href: "#", text: "Release Notes" },
];

export const communityLinks = [
  { href: "#", text: "Events" },
  { href: "#", text: "Meetups" },
  { href: "#", text: "Conferences" },
  { href: "#", text: "Workshops" },
  { href: "#", text: "Jobs" },
];
