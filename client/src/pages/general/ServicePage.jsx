import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../../components/Home/Footer.jsx';
import { cn } from '@/lib/utils';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Globe,
  Award,
  ArrowRight,
  Sparkles,
  Shield,
  Brain,
  Briefcase,
  Heart,
  Rocket,
  GraduationCap,
  Users,
  TrendingUp,
  Target,
  Lightbulb,
  BookOpen,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  Activity,
  Zap,
  Smile,
  Coffee,
  Moon,
  Sun,
  Leaf,
  Wind,
  Waves,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const Separator = () => (
  <>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 dark:from-primary-500 dark:via-primary-400 dark:to-primary-500 rounded-full" />
    <div className="absolute top-0 left-1/4 w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse" />
    <div
      className="absolute top-0 right-1/4 w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse"
      style={{ animationDelay: '0.5s' }}
    />
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-20 left-12 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/5 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-24 right-10 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-600/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '500ms' }}
      />
    </div>
  </>
);

const serviceData = {
  'mental-health-counseling': {
    title: 'Mental Health Counseling',
    icon: Brain,
    subtitle: 'Professional Mental Health Support',
    tagline: 'Your Mental Wellbeing Matters',
    description:
      'Connect with licensed therapists who provide compassionate, evidence-based care for anxiety, depression, stress, trauma, and other mental health concerns. Our counselors create a safe, confidential space where you can explore your thoughts and emotions, develop healthy coping strategies, and work towards lasting positive change.',
    heroFeatures: [
      { icon: Shield, text: 'Licensed Therapists' },
      { icon: Users, text: '500+ Lives Changed' },
      { icon: Clock, text: 'Flexible Scheduling' },
    ],
    secondaryImages: [
      'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&auto=format&fit=crop',
    ],
    bannerImage: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&auto=format&fit=crop',
    bannerTitle: 'Healing Starts with Taking the First Step',
    bannerDescription:
      'You deserve support during difficult times. Our compassionate therapists are here to guide you toward mental wellness and emotional balance.',
    keywords: [
      'Anxiety Relief',
      'Depression Support',
      'Stress Management',
      'Trauma Recovery',
      'Emotional Healing',
      'Mental Wellness',
      'Therapy Sessions',
      'Confidential Care',
      'PTSD Treatment',
      'Panic Disorder',
      'Self-Care',
      'Resilience Building',
    ],
    approaches: [
      {
        title: 'Cognitive Behavioral Therapy (CBT)',
        description:
          'Transform negative thought patterns into healthier perspectives. CBT is highly effective for anxiety, depression, OCD, and panic disorders, helping you identify triggers and develop practical coping mechanisms.',
        icon: Brain,
        image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&auto=format&fit=crop',
      },
      {
        title: 'Mindfulness-Based Therapy',
        description:
          'Learn to stay present and observe thoughts without judgment. Reduces rumination, manages overwhelming emotions, and builds emotional resilience through meditation and grounding techniques.',
        icon: Activity,
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop',
      },
      {
        title: 'Trauma-Focused Therapy',
        description:
          'Specialized care for PTSD, childhood trauma, and acute stress. Uses EMDR, somatic experiencing, and trauma-informed approaches to process painful memories safely and reclaim your sense of safety.',
        icon: Shield,
        image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&auto=format&fit=crop',
      },
      {
        title: 'Psychodynamic Therapy',
        description:
          'Explore unconscious patterns and past experiences that influence current behaviors. Gain deep self-awareness and resolve long-standing emotional conflicts to foster authentic growth.',
        icon: Target,
        image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&auto=format&fit=crop',
      },
    ],
    commonConcerns: [
      {
        title: 'Anxiety & Panic Disorders',
        description:
          'Overcome persistent worry, panic attacks, social anxiety, and phobias. Learn breathing techniques, exposure therapy, and cognitive restructuring to regain control and peace of mind.',
        icon: AlertCircle,
      },
      {
        title: 'Depression & Mood Disorders',
        description:
          'Address persistent sadness, loss of interest, hopelessness, and fatigue. Develop behavioral activation strategies, challenge negative thinking, and rebuild joy in daily life.',
        icon: Heart,
      },
      {
        title: 'Stress & Burnout',
        description:
          'Manage work stress, life transitions, and emotional exhaustion. Build resilience, establish boundaries, and create sustainable self-care practices for long-term wellbeing.',
        icon: Activity,
      },
      {
        title: 'Grief & Loss',
        description:
          'Navigate the pain of losing loved ones, relationships, or life circumstances. Process emotions healthily, find meaning, and honor your grief while moving forward.',
        icon: Heart,
      },
    ],
    faqs: [
      {
        question: 'How do I know if I need therapy?',
        answer:
          "If you're experiencing persistent sadness, anxiety, relationship issues, or feeling overwhelmed by daily life, therapy can help. There's no 'right' time to seek support—reaching out when you need it is a sign of strength.",
      },
      {
        question: 'Is therapy confidential?',
        answer:
          'Yes, all sessions are completely confidential. Your therapist is legally and ethically bound to protect your privacy, except in rare cases involving risk of harm to yourself or others.',
      },
      {
        question: 'How long does therapy take to work?',
        answer:
          "Many people notice improvements within 6-12 sessions, though this varies by individual and concern. Some issues resolve quickly while others benefit from longer-term support. Your therapist will work with you to set realistic goals and track progress.",
      },
      {
        question: 'What if I don\'t connect with my therapist?',
        answer:
          "The therapeutic relationship is crucial to success. If you don't feel comfortable with your therapist, we encourage you to try someone else. Finding the right fit is important, and it's completely normal to meet with a few therapists before choosing one.",
      },
    ],
    whyChoose: {
      title: 'Why Choose Professional Mental Health Support',
      points: [
        'Evidence-based treatments proven to create lasting change',
        'Licensed therapists with specialized mental health training',
        'Comprehensive assessment and personalized treatment plans',
        'Safe, confidential space free from judgment',
        'Crisis support and emergency resources when needed',
        'Integration with medication management when appropriate',
      ],
    },
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  },
  'life-personal-development': {
    title: 'Life & Personal Development',
    icon: Rocket,
    subtitle: 'Unlock Your Full Potential',
    tagline: 'Transform Your Life Today',
    description:
      "Work with experienced life coaches who help you clarify your vision, set meaningful goals, and create actionable plans for personal transformation. Whether you're seeking greater fulfillment, building confidence, or navigating major life transitions, our coaches provide the guidance, accountability, and tools you need to become your best self.",
    heroFeatures: [
      { icon: TrendingUp, text: 'Proven Growth Methods' },
      { icon: Target, text: 'Goal Achievement Focus' },
      { icon: Award, text: 'Certified Life Coaches' },
    ],
    secondaryImages: [
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&auto=format&fit=crop',
    ],
    bannerImage: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1200&auto=format&fit=crop',
    bannerTitle: 'Design the Life You\'ve Always Imagined',
    bannerDescription:
      'Stop dreaming and start doing. Our life coaches help you create a compelling vision and build the habits, mindset, and strategies to make it reality.',
    keywords: [
      'Goal Setting',
      'Personal Growth',
      'Self-Improvement',
      'Life Purpose',
      'Confidence Building',
      'Habit Formation',
      'Life Vision',
      'Success Mindset',
      'Transformation',
      'Self-Discovery',
      'Accountability',
      'Motivation',
    ],
    approaches: [
      {
        title: 'SMART Goal Framework',
        description:
          'Transform vague dreams into specific, measurable, achievable, relevant, and time-bound goals. Break down ambitious objectives into actionable steps with clear milestones and accountability measures.',
        icon: Target,
        image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&auto=format&fit=crop',
      },
      {
        title: 'Values-Based Living',
        description:
          'Discover your core values and align your daily choices with what truly matters. Live authentically, make confident decisions, and create a life that reflects your deepest priorities.',
        icon: Lightbulb,
        image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&auto=format&fit=crop',
      },
      {
        title: 'Habit Architecture',
        description:
          'Master the science of behavior change. Build positive habits that stick, break destructive patterns, and design your environment to support sustainable transformation.',
        icon: TrendingUp,
        image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=400&auto=format&fit=crop',
      },
      {
        title: 'Life Design Coaching',
        description:
          'Create a compelling vision for your future across all life areas. Map your ideal career, relationships, health, and lifestyle, then build a strategic roadmap to get there.',
        icon: Rocket,
        image: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400&auto=format&fit=crop',
      },
    ],
    commonConcerns: [
      {
        title: 'Finding Life Purpose',
        description:
          'Discover what makes you come alive and gives your life meaning. Explore your passions, strengths, and values to create a clear sense of direction and fulfillment.',
        icon: Target,
      },
      {
        title: 'Building Self-Confidence',
        description:
          'Transform self-doubt into unshakeable belief in yourself. Identify limiting beliefs, celebrate your strengths, and develop authentic confidence that radiates in all areas of life.',
        icon: TrendingUp,
      },
      {
        title: 'Life Transitions',
        description:
          'Navigate career changes, relocations, empty nest, divorce, or retirement with grace. Turn uncertainty into opportunity and reinvent yourself during major life shifts.',
        icon: Rocket,
      },
      {
        title: 'Work-Life Integration',
        description:
          'Create harmony between professional ambitions and personal fulfillment. Master time management, set healthy boundaries, and design a life that honors all your priorities.',
        icon: Clock,
      },
    ],
    faqs: [
      {
        question: 'What\'s the difference between life coaching and therapy?',
        answer:
          'Life coaching focuses on the future—setting goals, creating action plans, and achieving specific outcomes. Therapy often addresses past experiences and mental health concerns. Coaching is action-oriented and forward-focused.',
      },
      {
        question: 'How quickly will I see results?',
        answer:
          'Many clients experience clarity and momentum within the first few sessions. Significant life changes typically emerge over 3-6 months of consistent coaching, depending on your goals and commitment level.',
      },
      {
        question: 'Do I need to have specific goals in mind?',
        answer:
          "Not at all! Many clients start coaching feeling stuck or unclear about what they want. Your coach will help you gain clarity, identify what matters most, and define meaningful goals that excite you.",
      },
      {
        question: 'What if I fail to reach my goals?',
        answer:
          'Your coach is your accountability partner and cheerleader. Together, you\'ll identify obstacles, adjust strategies, and celebrate progress. "Failure" becomes feedback that helps you refine your approach and grow stronger.',
      },
    ],
    whyChoose: {
      title: 'Why Choose Life Coaching',
      points: [
        'Accelerated personal growth with expert guidance and support',
        'Customized strategies tailored to your unique situation',
        'Regular accountability to keep you on track and motivated',
        'Proven frameworks used by high-achievers worldwide',
        'Holistic approach addressing all life dimensions',
        'Results-focused coaching that creates measurable change',
      ],
    },
    image:
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  },
  'relationship-family-therapy': {
    title: 'Relationship & Family Therapy',
    icon: Heart,
    subtitle: 'Build Stronger Connections',
    tagline: 'Healthy Relationships, Happy Lives',
    description:
      'Strengthen the bonds that matter most with expert relationship and family counseling. Our specialized therapists help couples communicate more effectively, resolve conflicts constructively, rebuild trust, and deepen intimacy. For families, we address dynamics, improve understanding between generations, and create healthier patterns that benefit everyone.',
    heroFeatures: [
      { icon: Heart, text: 'Relationship Specialists' },
      { icon: Users, text: 'Family Systems Experts' },
      { icon: Shield, text: 'Safe, Neutral Space' },
    ],
    secondaryImages: [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop',
    ],
    bannerImage: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=1200&auto=format&fit=crop',
    bannerTitle: 'Reconnect, Rebuild, and Strengthen Your Relationships',
    bannerDescription:
      'Every relationship has challenges. With the right support, you can overcome obstacles, deepen intimacy, and create the loving connection you both deserve.',
    keywords: [
      'Couples Therapy',
      'Marriage Counseling',
      'Communication Skills',
      'Trust Building',
      'Intimacy Issues',
      'Conflict Resolution',
      'Pre-Marital',
      'Family Dynamics',
      'Parenting Support',
      'Relationship Repair',
      'Emotional Connection',
      'Love Languages',
    ],
    approaches: [
      {
        title: 'Emotionally Focused Therapy (EFT)',
        description:
          'Heal attachment wounds and deepen emotional connection. Identify negative patterns, express underlying needs, and create secure bonds that withstand challenges and grow stronger over time.',
        icon: Heart,
        image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&auto=format&fit=crop',
      },
      {
        title: 'Gottman Method',
        description:
          'Research-backed approach focusing on friendship, conflict management, and shared meaning. Build love maps, manage gridlock conflicts, and create rituals of connection that sustain lasting love.',
        icon: Users,
        image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&auto=format&fit=crop',
      },
      {
        title: 'Solution-Focused Therapy',
        description:
          'Move beyond problems to co-create solutions. Focus on your relationship strengths, envision your desired future together, and take concrete steps toward the partnership you both want.',
        icon: Target,
        image: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=400&auto=format&fit=crop',
      },
      {
        title: 'Family Systems Therapy',
        description:
          'Understand how each family member influences the whole. Address multigenerational patterns, clarify roles and boundaries, and transform unhealthy dynamics into supportive connections.',
        icon: Users,
        image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&auto=format&fit=crop',
      },
    ],
    commonConcerns: [
      {
        title: 'Communication Breakdown',
        description:
          'Learn to truly hear each other and express needs without triggering defensiveness. Master active listening, "I" statements, and techniques to de-escalate conflicts and find mutual understanding.',
        icon: MessageCircle,
      },
      {
        title: 'Trust & Betrayal',
        description:
          "Heal after infidelity or broken promises. Process emotions, understand root causes, rebuild safety and transparency, and make informed decisions about your relationship's future.",
        icon: Shield,
      },
      {
        title: 'Intimacy Issues',
        description:
          'Reconnect emotionally and physically. Address mismatched desires, vulnerability fears, and communication barriers that prevent closeness and passion in your relationship.',
        icon: Heart,
      },
      {
        title: 'Parenting Conflicts',
        description:
          'Align on discipline approaches, co-parenting strategies, and family values. Bridge disagreements about raising children and present a united, consistent front for your kids.',
        icon: Users,
      },
    ],
    faqs: [
      {
        question: 'Should we try therapy or just break up?',
        answer:
          "If you're asking this question, therapy can help you gain clarity. Many couples discover new ways to connect and resolve issues they thought were insurmountable. Therapy provides tools to make an informed decision about your relationship's future.",
      },
      {
        question: 'What if my partner won\'t come to therapy?',
        answer:
          'Individual therapy can still help you improve communication patterns, set boundaries, and make positive changes. Often, when one partner changes their approach, the relationship dynamic shifts positively.',
      },
      {
        question: 'How long does couples therapy take?',
        answer:
          'Most couples see improvement within 8-20 sessions, though this varies by situation. Some couples come for brief tune-ups while others benefit from longer-term support during major transitions or healing from betrayal.',
      },
      {
        question: 'Will the therapist take sides?',
        answer:
          'No. A skilled therapist remains neutral and advocates for the relationship itself. They create a safe space for both partners to be heard, understood, and supported in finding solutions together.',
      },
    ],
    whyChoose: {
      title: 'Why Choose Relationship Therapy',
      points: [
        'Neutral third party who provides unbiased perspective',
        'Safe environment where both partners feel heard',
        'Evidence-based techniques proven to improve relationships',
        'Support for all relationship types and family structures',
        'Prevention-focused strategies to strengthen healthy relationships',
        "Tools you'll use long after therapy ends",
      ],
    },
    image:
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  },
  'career-professional-coaching': {
    title: 'Career & Professional Coaching',
    icon: Briefcase,
    subtitle: 'Advance Your Career',
    tagline: 'Your Success is Our Mission',
    description:
      "Partner with career coaches who help professionals at all levels clarify their career direction, navigate transitions, develop leadership skills, and achieve ambitious goals. Whether you're seeking promotion, changing careers, struggling with workplace challenges, or building your personal brand, our coaches provide strategic guidance and practical tools for professional success.",
    heroFeatures: [
      { icon: Briefcase, text: 'Career Strategists' },
      { icon: TrendingUp, text: '90% Achieve Goals' },
      { icon: Award, text: 'Industry Expertise' },
    ],
    secondaryImages: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop',
    ],
    bannerImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop',
    bannerTitle: 'Accelerate Your Career to New Heights',
    bannerDescription:
      'Stop feeling stuck in your career. Get expert guidance to clarify your path, build your brand, and achieve the professional success you deserve.',
    keywords: [
      'Career Planning',
      'Job Search',
      'Resume Building',
      'Interview Prep',
      'Leadership Skills',
      'Career Change',
      'Promotion Strategy',
      'Personal Branding',
      'Networking',
      'Salary Negotiation',
      'Executive Coaching',
      'Professional Growth',
    ],
    approaches: [
      {
        title: 'Career Assessment & Planning',
        description:
          'Identify your strengths, interests, values, and personality through validated assessments. Explore careers aligned with your authentic self and create a strategic roadmap for your professional journey.',
        icon: Target,
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop',
      },
      {
        title: 'Executive Coaching',
        description:
          'Develop leadership presence, strategic thinking, and emotional intelligence. Navigate complex organizational dynamics, influence stakeholders, and prepare for C-suite and senior leadership roles.',
        icon: Award,
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&auto=format&fit=crop',
      },
      {
        title: 'Career Transition Strategy',
        description:
          'Successfully navigate career pivots, industry changes, or entrepreneurship. Identify transferable skills, build relevant experience, network strategically, and position yourself for new opportunities.',
        icon: Rocket,
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&auto=format&fit=crop',
      },
      {
        title: 'Personal Branding',
        description:
          'Define your unique value proposition and communicate it powerfully. Optimize your LinkedIn, resume, portfolio, and online presence to attract opportunities aligned with your goals.',
        icon: Sparkles,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop',
      },
    ],
    commonConcerns: [
      {
        title: 'Career Direction Clarity',
        description:
          'Break free from feeling stuck or uncertain about your path. Gain crystal-clear vision of your ideal career, understand your options, and make confident decisions about your future.',
        icon: Target,
      },
      {
        title: 'Workplace Challenges',
        description:
          'Navigate difficult bosses, office politics, toxic cultures, and interpersonal conflicts. Develop professional boundaries, communication strategies, and resilience to thrive despite challenges.',
        icon: AlertCircle,
      },
      {
        title: 'Promotion & Advancement',
        description:
          'Position yourself for promotions and salary increases. Build visibility, demonstrate impact, develop strategic relationships, and negotiate compensation effectively.',
        icon: TrendingUp,
      },
      {
        title: 'Work-Life Balance',
        description:
          'Prevent burnout and create sustainable success. Set boundaries, prioritize effectively, delegate strategically, and integrate professional ambition with personal fulfillment.',
        icon: Activity,
      },
    ],
    faqs: [
      {
        question: 'When is the best time to hire a career coach?',
        answer:
          "Anytime you feel stuck, unfulfilled, or facing a career decision. Whether you're job searching, seeking promotion, changing careers, or feeling burned out, a coach can provide clarity and strategy.",
      },
      {
        question: 'How is career coaching different from a mentor?',
        answer:
          'Mentors share their specific experience and advice. Career coaches use proven frameworks, assessments, and strategies to help you discover your own path. Coaching is more structured, goal-focused, and provides accountability.',
      },
      {
        question: 'Will career coaching guarantee me a job?',
        answer:
          "While we can't guarantee job offers, career coaching dramatically increases your chances by helping you target the right roles, optimize your materials, ace interviews, and build strategic relationships.",
      },
      {
        question: 'How long does career coaching take?',
        answer:
          'It depends on your goals. Job search coaching may take 2-3 months, while leadership development or career transition might span 6-12 months. Your coach will create a timeline based on your specific objectives.',
      },
    ],
    whyChoose: {
      title: 'Why Choose Career Coaching',
      points: [
        'Insider knowledge of hiring processes and career advancement',
        'Personalized strategies based on your goals and circumstances',
        'Resume, LinkedIn, and interview preparation support',
        'Accountability partner who keeps you focused and motivated',
        'Salary negotiation coaching worth thousands of dollars',
        'Network expansion through industry connections',
      ],
    },
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  },
  'health-wellness-coaching': {
    title: 'Health & Wellness Coaching',
    icon: Sparkles,
    subtitle: 'Holistic Wellness Support',
    tagline: 'Thrive in Mind, Body & Spirit',
    description:
      'Achieve lasting wellness through holistic coaching that addresses your physical health, mental wellbeing, and lifestyle habits. Our certified wellness coaches help you create sustainable changes in nutrition, exercise, stress management, sleep, and self-care. They meet you where you are and support you in building a healthier, more vibrant life.',
    heroFeatures: [
      { icon: Sparkles, text: 'Holistic Approach' },
      { icon: Activity, text: 'Sustainable Methods' },
      { icon: TrendingUp, text: 'Lasting Results' },
    ],
    secondaryImages: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop',
    ],
    bannerImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop',
    bannerTitle: 'Embrace a Healthier, More Vibrant You',
    bannerDescription:
      'Transform your health and vitality with personalized wellness coaching. Create sustainable habits that nourish your body, calm your mind, and energize your spirit.',
    keywords: [
      'Holistic Health',
      'Nutrition Guidance',
      'Stress Relief',
      'Sleep Better',
      'Fitness Goals',
      'Mindfulness',
      'Self-Care',
      'Energy Boost',
      'Wellness Plan',
      'Healthy Habits',
      'Mind-Body',
      'Lifestyle Change',
    ],
    approaches: [
      {
        title: 'Integrative Wellness',
        description:
          'Address the interconnection of physical health, mental wellbeing, and lifestyle factors. Create a personalized wellness plan that considers nutrition, movement, sleep, stress, and social connection.',
        icon: Sparkles,
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&auto=format&fit=crop',
      },
      {
        title: 'Behavior Change Coaching',
        description:
          'Master the psychology of habit formation. Build sustainable healthy behaviors through small incremental changes, positive reinforcement, and addressing the root causes of resistance.',
        icon: TrendingUp,
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop',
      },
      {
        title: 'Stress Resilience Training',
        description:
          'Learn evidence-based stress management techniques including breathwork, progressive relaxation, and cognitive reframing. Build your stress tolerance and recovery capacity.',
        icon: Activity,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop',
      },
      {
        title: 'Mindful Living Practices',
        description:
          'Cultivate present-moment awareness through meditation, mindful eating, and conscious movement. Reduce anxiety, improve focus, and develop a compassionate relationship with yourself.',
        icon: Brain,
        image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&auto=format&fit=crop',
      },
    ],
    commonConcerns: [
      {
        title: 'Chronic Stress & Burnout',
        description:
          'Recover from prolonged stress that depletes your energy and health. Activate your relaxation response, restore balance, and build resilience for long-term stress management.',
        icon: Activity,
      },
      {
        title: 'Sleep Optimization',
        description:
          'Overcome insomnia, poor sleep quality, and fatigue. Establish healthy sleep hygiene, address sleep disruptors, and create bedtime routines that promote restorative rest.',
        icon: Moon,
      },
      {
        title: 'Energy & Vitality',
        description:
          'Boost natural energy through nutrition, movement, stress management, and lifestyle optimization. Address fatigue causes and reclaim the vitality you deserve.',
        icon: Zap,
      },
      {
        title: 'Sustainable Habits',
        description:
          'Build lasting healthy habits around nutrition, exercise, and self-care. Overcome obstacles, stay motivated through challenges, and make wellness your natural lifestyle.',
        icon: CheckCircle,
      },
    ],
    faqs: [
      {
        question: 'Is wellness coaching a replacement for medical care?',
        answer:
          "No. Wellness coaches complement your medical care by helping you implement lifestyle changes. We work alongside your healthcare providers and always recommend consulting doctors for medical concerns.",
      },
      {
        question: 'Do I need to follow a strict diet or exercise plan?',
        answer:
          "Not at all. We create personalized, flexible plans that fit your preferences and lifestyle. The focus is on sustainable changes you can maintain long-term, not restrictive rules that feel like punishment.",
      },
      {
        question: 'How quickly will I see results?',
        answer:
          'Many clients notice increased energy and improved mood within 2-3 weeks. Significant physical changes typically emerge over 2-3 months. Lasting transformation comes from consistent small changes over time.',
      },
      {
        question: 'What if I\'ve tried and failed before?',
        answer:
          "Past 'failures' are learning experiences. Wellness coaching addresses the root causes of why changes didn't stick before—often related to mindset, motivation, or unrealistic expectations. Together, we'll create a sustainable approach that works for you.",
      },
    ],
    whyChoose: {
      title: 'Why Choose Wellness Coaching',
      points: [
        'Personalized wellness plans tailored to your lifestyle',
        'Evidence-based strategies supported by research',
        'Support for chronic condition management alongside medical care',
        'Focus on sustainable changes, not quick fixes',
        'Mind-body connection emphasis for holistic healing',
        'Ongoing support and accountability for lasting results',
      ],
    },
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  },
  'academic-student-support': {
    title: 'Academic & Student Support',
    icon: GraduationCap,
    subtitle: 'Excel in Your Studies',
    tagline: 'Academic Success Starts Here',
    description:
      'Get specialized support for the unique challenges students face. Our counselors understand academic pressure, social dynamics, identity development, and future planning. We help students of all ages manage stress, improve study skills, navigate social challenges, explore career options, and develop confidence for academic and personal success.',
    heroFeatures: [
      { icon: GraduationCap, text: 'Education Specialists' },
      { icon: Users, text: '1000+ Students Helped' },
      { icon: TrendingUp, text: 'Improved Performance' },
    ],
    secondaryImages: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop',
    ],
    bannerImage: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&auto=format&fit=crop',
    bannerTitle: 'Unlock Your Academic Potential',
    bannerDescription:
      'Achieve academic excellence while maintaining wellbeing. Our counselors help students manage pressure, improve study skills, and build confidence for lifelong success.',
    keywords: [
      'Study Skills',
      'Test Anxiety',
      'Academic Pressure',
      'Time Management',
      'Career Guidance',
      'College Prep',
      'Motivation',
      'Learning Strategies',
      'Exam Success',
      'Student Wellbeing',
      'Focus & Concentration',
      'Grade Improvement',
    ],
    approaches: [
      {
        title: 'Academic Skills Development',
        description:
          'Master effective study techniques, note-taking methods, reading comprehension, and exam strategies. Develop time management skills and organizational systems that set you up for success.',
        icon: BookOpen,
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop',
      },
      {
        title: 'Test Anxiety Management',
        description:
          'Overcome fear and stress around exams. Learn relaxation techniques, cognitive restructuring for negative thoughts, and test-taking strategies that help you perform at your best.',
        icon: Brain,
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop',
      },
      {
        title: 'Career Exploration',
        description:
          'Discover your interests, strengths, and values through assessments and exploration. Research career paths, understand educational requirements, and make informed decisions about your future.',
        icon: Target,
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&auto=format&fit=crop',
      },
      {
        title: 'Social-Emotional Support',
        description:
          'Navigate peer relationships, bullying, identity development, and social anxiety. Build confidence, communication skills, and healthy friendships during critical developmental years.',
        icon: Heart,
        image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&auto=format&fit=crop',
      },
    ],
    commonConcerns: [
      {
        title: 'Academic Pressure',
        description:
          'Manage overwhelming coursework, high expectations, and pressure to perform. Develop healthy perspectives on success, prioritization skills, and stress management techniques.',
        icon: AlertCircle,
      },
      {
        title: 'Study Skills & Organization',
        description:
          'Transform chaotic study habits into efficient systems. Learn how to take effective notes, manage assignments, prepare for exams, and retain information long-term.',
        icon: BookOpen,
      },
      {
        title: 'Motivation & Procrastination',
        description:
          'Overcome lack of motivation and procrastination patterns. Identify barriers, set meaningful goals, create accountability systems, and build momentum toward your dreams.',
        icon: TrendingUp,
      },
      {
        title: 'College Transition',
        description:
          'Adjust successfully to college life. Navigate independence, time management, social dynamics, homesickness, and academic rigor with support and practical strategies.',
        icon: Rocket,
      },
    ],
    faqs: [
      {
        question: 'Will my parents be involved in the sessions?',
        answer:
          "It depends on your age and preference. For younger students, parent involvement is often helpful. Older teens and college students typically meet one-on-one, with periodic parent check-ins if desired.",
      },
      {
        question: 'Can counseling really improve my grades?',
        answer:
          'Yes! By addressing test anxiety, improving study skills, enhancing motivation, and managing stress, most students see noticeable grade improvements within one semester.',
      },
      {
        question: 'What if I don\'t know what career I want?',
        answer:
          "That's completely normal! Career counseling includes assessments, exploration activities, and discussions to help you discover your interests, strengths, and potential paths. Many students find clarity through this process.",
      },
      {
        question: 'Is student counseling confidential?',
        answer:
          'Yes, with age-appropriate boundaries. We maintain confidentiality unless there are safety concerns. For minors, we discuss with you what information to share with parents and respect your privacy as much as possible.',
      },
    ],
    whyChoose: {
      title: 'Why Choose Student Support',
      points: [
        'Deep understanding of student-specific pressures and challenges',
        'Age-appropriate counseling approaches and communication',
        'Integration of academic support with emotional wellbeing',
        'Career exploration and college planning guidance',
        'Family involvement and parent consultation when beneficial',
        'Safe, confidential space for students to be themselves',
      ],
    },
    image:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  },
};

const serviceIdMap = {
  'mental-health': 'mental-health-counseling',
  career: 'career-professional-coaching',
  relationship: 'relationship-family-therapy',
  'life-coaching': 'life-personal-development',
  financial: 'financial-counselling',
  academic: 'academic-student-support',
  'health-wellness': 'health-wellness-coaching',
};

const ServicePage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const mappedServiceId = serviceIdMap[serviceId] || serviceId;
  const service = serviceData[mappedServiceId];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  };

  const staggerContainer = {
    animate: {
      transition: { staggerChildren: 0.1 },
    },
  };

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-100 to-primary-200/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 p-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Service Not Found
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-base sm:text-lg">
            The service you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="mt-6 group bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Back to Home
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    );
  }

  const IconComponent = service.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-100 to-primary-200/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30">
      {/* HERO SECTION */}
      <motion.section
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="relative min-h-[85vh] flex items-center bg-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div variants={fadeInUp} className="space-y-4 sm:space-y-6 lg:space-y-8">
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/20 hover:bg-primary-100/50 dark:hover:bg-primary-900/30 transition-colors"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                {service.subtitle}
              </Badge>

              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                  {service.title}
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  {service.tagline}
                </p>
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6">
                {service.heroFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="flex items-center gap-2 text-xs sm:text-sm lg:text-base text-neutral-700 dark:text-neutral-300"
                  >
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <feature.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              
            </motion.div>

            {/* Right Image */}
            <motion.div variants={fadeInUp} className="relative order-first lg:order-last">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-neutral-800 group">
                <div className="aspect-[4/3] sm:aspect-[4/5] lg:aspect-square">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Glow effect on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />

                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 bg-white dark:bg-neutral-900 p-3 sm:p-4 rounded-xl shadow-2xl border border-primary-200 dark:border-primary-800 backdrop-blur-sm">
                  <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary-600 dark:text-primary-400" />
                </div>

                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-lg border border-primary-200 dark:border-primary-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        500+
                      </p>
                      <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">
                        Happy Clients
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="relative mb-4">
        <Separator />
      </div>

      {/* KEYWORDS SECTION */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4">
              What We{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Specialize In
              </span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Comprehensive support across all aspects of {service.title.toLowerCase()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3"
          >
            {service.keywords.map((keyword, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <Badge
                  variant="secondary"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-white dark:bg-neutral-900 border-2 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-default shadow-sm"
                >
                  {keyword}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="relative mb-4">
        <Separator />
      </div>

      

      {/* BANNER SECTION */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={service.bannerImage}
                alt={service.bannerTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 px-6 sm:px-8 lg:px-16 py-12 sm:py-16 lg:py-20">
              <div className="max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                    {service.bannerTitle}
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-6 sm:mb-8 leading-relaxed">
                    {service.bannerDescription}
                  </p>
                  <Button
                    size="lg"
                    onClick={() => navigate('/browse-counselors')}
                    className="group bg-white hover:bg-neutral-100 text-primary-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base rounded-xl"
                  >
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="relative mb-4">
        <Separator />
      </div>

      {/* APPROACHES SECTION - with images */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <Badge
              variant="outline"
              className="mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/20"
            >
              <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
              Our Methods
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 px-4">
              Therapeutic{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Approaches
              </span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto px-4">
              Evidence-based methods tailored to your specific needs and goals
            </p>
          </motion.div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {service.approaches.map((approach, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card className="h-full border-primary-200 dark:border-primary-800 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-neutral-900 overflow-hidden group relative">
                  {/* Glow effect from right corner */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                  
                  {/* Image */}
                  {approach.image && (
                    <div className="relative h-40 sm:h-48 overflow-hidden">
                      <img
                        src={approach.image}
                        alt={approach.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>
                  )}
                  
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <motion.div
                        whileHover={{ rotate: 12 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg"
                      >
                        <approach.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                          {approach.title}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm lg:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {approach.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative mb-4">
        <Separator />
      </div>

      {/* COMMON CONCERNS SECTION */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <Badge
              variant="outline"
              className="mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/20"
            >
              <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
              We Can Help
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 px-4">
              Common{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Concerns We Address
              </span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto px-4">
              You're not alone. We specialize in helping people overcome these challenges
            </p>
          </motion.div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {service.commonConcerns.map((concern, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card className="h-full border-primary-200 dark:border-primary-800 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-neutral-900 group relative">
                  {/* Glow effect from right corner */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                  
                  <CardContent className="pt-5 sm:pt-6 relative z-10">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <motion.div
                        whileHover={{ rotate: 12 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"
                      >
                        <concern.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                          {concern.title}
                        </h3>
                        <p className="text-xs sm:text-sm lg:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {concern.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative mb-4">
        <Separator />
      </div>

      {/* FAQ SECTION */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12"
          >
            <Badge
              variant="outline"
              className="mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/20"
            >
              <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
              Common Questions
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-neutral-600 dark:text-neutral-400">
              Get answers to common questions about {service.title.toLowerCase()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {service.faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-2 border-primary-200 dark:border-primary-800 rounded-xl px-4 sm:px-6 bg-white dark:bg-neutral-900 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-4 sm:py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm lg:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed pb-4 sm:pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      <div className="relative mb-4">
        <Separator />
      </div>

      {/* WHY CHOOSE SECTION */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-primary-300 dark:border-primary-700 shadow-2xl bg-gradient-to-br from-white to-primary-50/50 dark:from-neutral-900 dark:to-primary-950/30 backdrop-blur-sm overflow-hidden relative group">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
              
              <CardContent className="p-6 sm:p-8 lg:p-12 relative z-10">
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <motion.div
                    whileHover={{ rotate: 12 }}
                    transition={{ duration: 0.3 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl"
                  >
                    <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    {service.whyChoose.title}
                  </h3>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {service.whyChoose.points.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="flex items-start gap-3 group/item"
                    >
                      <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 group-hover/item:scale-110 transition-transform duration-300" />
                      </div>
                      <p className="text-xs sm:text-sm lg:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {point}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <div className="relative mb-4">
        <Separator />
      </div>

      {/* CTA SECTION */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-primary-300 dark:border-primary-700 shadow-2xl bg-gradient-to-br from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900 overflow-hidden relative group">
              {/* Calming particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary-400/30 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-primary-300/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-primary-500/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-primary-400/20 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
              </div>
              
              <CardContent className="p-6 sm:p-8 lg:p-12 xl:p-16 relative z-10">
                <div className="text-center space-y-4 sm:space-y-6">
                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-xl mb-2 sm:mb-4"
                  >
                    <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </motion.div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-900 dark:text-neutral-100 px-4">
                    Ready to Get Started?
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed px-4">
                    Book a session with one of our expert counselors and take the first step
                    towards positive change. Your journey to wellbeing starts here.
                  </p>
                  <div className="pt-2 sm:pt-4">
                    <Button
                      size="lg"
                      onClick={() => navigate('/browse-counselors')}
                      className="group bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base lg:text-lg rounded-xl w-full sm:w-auto"
                    >
                      Browse Counselors
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ServicePage;
