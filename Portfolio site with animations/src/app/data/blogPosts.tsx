import type { ReactNode } from "react";
import { useIsMobile } from "@/app/hooks/useIsMobile";

export type BlogCategory = "write about design" | "personal musings" | "life in a nutshell";

export interface BlogPost {
  id: number;
  slug: string;
  date: string;
  readTime: string;
  title: string;
  subtitle: string;
  body: ReactNode[];
  category: BlogCategory;
}

export const BLOG_CATEGORIES: BlogCategory[] = ["write about design", "personal musings", "life in a nutshell"];

// Media for "The tactile charm of micro-interactions" lives in
// public/blog-media/tactile-charm/ (mirrored from the original Canvs piece).
// Base-aware so it resolves at "/" locally and "/portfolio/" on GitHub Pages.
const MICRO_MEDIA = `${import.meta.env.BASE_URL}blog-media/tactile-charm/`;

// Body-level building blocks. These render *inside* the <p> wrapper that
// BlogPostDrawer/PostBody wrap every body node in, so they must stay
// inline-safe — spans only, never <div>/<figure>/<h2>.
function BlogFigure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const isMobile = useIsMobile(768);
  // Break out of the body's text padding so the image spans the full drawer
  // width (as wide as the layout allows), then scale height to match.
  const padL = isMobile ? 16 : 36;
  const padR = isMobile ? 16 : 52;
  return (
    <span
      style={{
        display: "block",
        marginLeft: -padL,
        marginRight: -padR,
        marginTop: 12,
        marginBottom: 12,
        width: `calc(100% + ${padL + padR}px)`,
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          borderRadius: isMobile ? 0 : 10,
        }}
      />
      {caption && (
        <span
          className="font-inclusive-sans"
          style={{
            display: "block",
            fontSize: 13,
            lineHeight: "18px",
            color: "#625e37",
            opacity: 0.75,
            marginTop: 10,
            padding: `0 ${padR}px 0 ${padL}px`,
            textAlign: "center",
          }}
        >
          {caption}
        </span>
      )}
    </span>
  );
}

function BlogHeading({ children, sub }: { children: ReactNode; sub?: boolean }) {
  return sub ? (
    <span
      className="font-inclusive-sans font-medium uppercase"
      style={{
        display: "block",
        fontSize: 12,
        letterSpacing: "0.5px",
        color: "#625e37",
        marginTop: 8,
      }}
    >
      {children}
    </span>
  ) : (
    <span
      className="font-caslon not-italic"
      style={{
        display: "block",
        fontSize: 22,
        lineHeight: "28px",
        color: "#212012",
        fontWeight: 600,
        marginTop: 16,
      }}
    >
      {children}
    </span>
  );
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 3,
    slug: "sukoon",
    date: "Nov 2025",
    readTime: "9 min read",
    category: "life in a nutshell",
    title: "सुकून",
    subtitle: "Or, How I Became a Person Who Assembles IKEA Sofas and Passes Out Mid-Pedicure.",
    body: [
      `1st November, 2025. The date I moved into a place I now call home. More accurately, सुकून. Because “home” is a word everyone uses, and this felt like something quieter and more specific than that.`,
      "The long version of how I got here involves two strangers, one dangerously optimistic girl (me, one month prior, truly eating up the idea of making new friends), and a living situation I will only describe as character-building. After three years of living with my sister, I thought — confidently, incorrectly — that moving in with two other girls in a different part of the city would mean new friends, shared dinners, a thriving little girl-gang. What it actually meant was a masterclass in human incompatibility and a very fast, very decisive move to live alone. I found a place. I signed a lease. I exhaled for the first time in a month.",
      "I moved in on a Saturday and I haven't looked back, miss me with those roommate suggestions.",
      "The apartment had five windows. Five. And a balcony that overlooked a teakwood tree. I want it on record that I am constitutionally incapable of saying no to a balcony with a tree. The moment I saw it, the apartment was already mine in my head.",
      "Before anything could be beautiful though, it had to be clean. Deeply, aggressively, obsessively clean. I cleaned the apartment approximately 228,903 times before I felt okay about it. I spent an entire day just on the windows. If you need context for this level of commitment, I'd like to introduce you to my mother, who is an absolute psycho when it comes to cleaning — and I say that with so much love, and full self-awareness that I have become her. The OCD is hereditary and I collected it without signing any forms.",
      "Curtains came next, and I have opinions. Strong ones. Curtains make or break a house, full stop. Not art, not furniture, not the rug everyone tells you will tie the room together. Curtains. I knew exactly what I wanted — cotton, natural, soft — so I got a few metres of cloth from a local market back home, requested my mom to stitch the hoops, ironed them myself, and hung them up. The first afternoon the sunlight came through, the room glowed. I stood there feeling very, very smug. Justified smug.",
      "Now, the furniture situation. Here is a list of things I assembled entirely by myself: one IKEA sofa (the complicated kind, the kind that makes you question your life choices at step 4 of 27), one IKEA table and chairs, a TV stand, and a bed. Solo. With my own two hands. A self-described weakling became a person who does things, and I'm going to talk about it forever, you're welcome.",
      "And then my brother showed up. He helped me set up the gas connection. He came to IKEA with zero complaints, carried things, held the instruction manual without being asked, and was genuinely, suspiciously helpful — while also eating like he hadn't seen food in a week. Every single task came with a side of 'what are we having later.' Sweetheart. Absolute sweetheart.",
      "I did all of this without taking a single day of leave from work. My brain was running purely on chaos and the specific dopamine of checking things off a list. Not recommended. Would do again.",
      "The first thing I set up, before the bed was fully done and before the curtains were hung, was the music system. I put on a track from my favourite artist — nine years of listening, still not tired — and something settled. That was the moment I knew I was going to write this. Nothing else that entire month came close to that specific feeling: music from a real speaker, in a space that was finally, completely mine.",
      "The plants were always part of the plan, obviously. I got them from a government nursery back home, transported an alarming number of pots via public transport, and my mom sent four boxes through a bus service at genuinely peanut prices. I collected all four of them alone from a bus station, then carried them up to the third floor. No lift. I felt like a superhero and also like I was going to die. The plants are doing beautifully, except a couple that didn't make it.",
      "My favourite corner in the entire apartment is the bookshelf. It has an energy I can only call grandmother-coded — a wooden bedside table that feels inherited rather than purchased, a collection of books built up slowly over years (Sidney Sheldon is my most-read author; the man understood drama and I respect it deeply).",
      "Through all of this, my family showed up in the ways that count. My mom, who is clearly the reason I am who I am. My sister, who was present at exactly the right moments. My brother, who helped and ate and brought my pots home to me.",
      "I took my time. I did it my way. I built something I genuinely love.",
      "When it was finally, mostly done, I booked myself a pedicure. A gift to myself for moving a life across a city, assembling furniture alone, carrying plants up stairs, and generally being a person who figures it out.",
      "I passed out in the pedicure chair. Fully. Completely. Mid-appointment. Because my body looked at that warm chair and that foot soak and made a unilateral decision. Honestly, fair. We'd both earned it.",
      "सुकून, in every form it takes.",
    ],
  },
  {
    id: 4,
    slug: "5-things-living-alone-turned-me-into",
    date: "Dec 2025",
    readTime: "6 min read",
    category: "life in a nutshell",
    title: "5 Things Living Alone Turned Me Into",
    subtitle: "Voluntarily, mostly.",
    body: [
      "Living alone does something to you. Not in a dramatic, eat-pray-love way. More in a quiet, incremental way where one day you're oiling your hair on a Tuesday night and eating a salad you actually made yourself and you think, huh. When did this happen.",
      "Here are five things I started doing when I moved in, that I now cannot imagine my life without. Four of them are genuinely good for me. One of them scared me.",
      "1. Running. I love dressing up for a run. This is important context. The outfit has to be right, the shoes have to be right, and yes, I am aware this is a whole thing, but the dopamine I get after a good run is the cleanest kind I know and I will protect it accordingly. I run through Indiranagar's quieter lanes, mostly in the evenings, on roads that are properly canopied by trees. There's a specific glow after a good run that I genuinely cannot describe without sounding unhinged, so I won't try. What I will say is that it's real, it's earned, and it's mine.",
      "I also want to be honest: I love running with friends. What I do not love is the paid group marathon format where you show up, run, and leave. That's not running with people, that's just running near them. Miss me with that.",
      "2. Gymming. I have, on more than one occasion, cancelled family plans and taken an early bus back to Bangalore because I was not going to break my gym streak. I am fully aware of how this sounds. I stand by it. Going to the gym regularly is the one area of my life where I have something resembling discipline, and I am holding onto that with both hands.",
      "I have also skipped. Several times. And every single time, the guilt arrives immediately and makes itself comfortable and starts asking questions about my character. The guilt of not going has made me question my existence in ways that are disproportionate and also completely understandable.",
      "3. Eating well. Actually well. Ghar ka khana hits different when it's your ghar. I have a cook who makes genuinely amazing food, better than me, and I will not be taking questions on that. I barely eat out, and even when I do, it somehow ends up being on the healthier side, which I did not plan but have fully accepted. Salads I actually look forward to. Smoothies I make every morning that taste embarrassingly, unreasonably good.",
      "And before you count me out entirely — I make a mean roll, a mean sandwich, and a mean omelette. Not out of necessity. Out of talent. There's a difference.",
      "4. Actually taking care of myself. Living alone quietly handed me back the time and the space to just take care of myself. Therapy, which I take seriously and which has been worth every rupee and every slightly uncomfortable session. Hair oiling once or twice a week. Skincare, which I do regularly and which I am aware is a gentle slide down the capitalist slope, but I have some level of self-control. Living alone removed the noise and left me with myself. Turns out I'm worth the maintenance.",
      "5. Managing my finances. This one did not go the way I expected. I looked at my bank balance. My bank balance looked back. I have not made eye contact with it since. The urge to buy every cute thing I see is real, ancient, and deeply embedded in who I am, and it turns out living alone near good markets, good cafes, and the entire internet does not help this condition. We are in a complicated relationship, my bank balance and I.",
      "I am working on it. The bank app notification from last Tuesday remains unread and I am at peace with that.",
      "So that's the list. Running, gymming, eating well, and taking care of myself — four things living alone installed in me that I'm genuinely proud of. The fifth one is between me and my bank balance and we are not ready to go public with that yet.",
      "The rent is high. The smoothie is good. The cook is better than me but I make an excellent omelette and I will be bringing that up forever.",
      "We're doing okay.",
    ],
  },
  {
    id: 5,
    slug: "the-tactile-charm-of-micro-interactions",
    date: "Mar 2025",
    readTime: "9 min read",
    category: "write about design" as BlogCategory,
    title: "The tactile charm of micro-interactions",
    subtitle:
      "From the subtle bounce of a loading screen to the satisfying feedback of a tap — the small details that turn ordinary actions into intentional experiences.",
    body: [
      "This piece was originally published with Canvs Editorial. It's a collection of my thoughts on micro-interactions — how they've evolved, why these small design choices matter so much in the digital world and the real one, and how insights from data can make these moments of user delight even better.",
      <BlogFigure
        key="hero"
        src={`${MICRO_MEDIA}01-hero.png`}
        alt="Illustration of micro-interactions across everyday devices"
      />,
      "It's 7:30 AM, and my phone's alarm gradually increases in volume — a thoughtful, tiny interaction that eases me into consciousness rather than jolting me awake. As I reach for my phone, the familiar haptic feedback of the “slide to stop” gesture marks the official start of my day. This moment, though small, sets the tone for the countless subtle interactions that will shape my next 24 hours.",
      <BlogHeading key="h-what">What are micro-interactions?</BlogHeading>,
      "These are small moments that make an interface or product feel alive. They're the animations, sounds, haptics, and visual cues that guide users, provide feedback, and add personality to a product. When done well, they're invisible yet indispensable, turning mundane tasks into delightful experiences.",
      "What's more, micro-interactions are everywhere — from physical objects to digital apps.",
      <BlogHeading key="h-back">Looking back, briefly</BlogHeading>,
      "IBM was one of the first companies to add basic micro-interactions as feedback mechanisms in early computers. Their typewriter-style keyboards with tactile feedback — the “click” of each keystroke — were an early precursor to what we now see as micro-interactions in digital products.",
      <BlogFigure
        key="ibm"
        src={`${MICRO_MEDIA}02-ibm-keyboard.png`}
        alt="IBM typewriter-style keyboard"
        caption="IBM's typewriter-style keyboard"
      />,
      "When the first Macintosh arrived in 1984, it brought intuitive visual feedback in the form of simple things: the pointer changing to a hand when hovering over a link, and the trash can animation when dragging files to delete. These small touches gave users meaningful feedback that transformed basic computing tasks into something more engaging.",
      <BlogFigure
        key="mac"
        src={`${MICRO_MEDIA}03-mac-cursors.png`}
        alt="The classic Macintosh cursors"
        caption="Mac's classic cursors"
      />,
      "Apple: the launch of the iPhone brought micro-interactions to the mainstream. The iconic slide-to-unlock gesture was simple yet profound. The visual change and tactile feedback as you slid your finger across the screen made unlocking the phone more than functional — it became an experience.",
      "Pull-to-refresh: Loren Brichter, a designer and developer, created the famous “pull-to-refresh” interaction for the Twitter app in 2009. It was revolutionary because it turned a mundane task — reloading content — into something visually engaging and interactive. The gesture itself, with its small bounce-back animation and dynamic loading progression, was incredibly satisfying, and it quickly became a defining feature of mobile interfaces.",
      "Google's Material Design (2014): Material Design took micro-interactions to a whole new level — subtle animations, smooth transitions, and feedback loops that helped users navigate with ease. Think floating action buttons and those fluid screen-to-screen transitions. It wasn't just about pretty animations; they made the experience more intuitive and responsive, and Google kept them consistent across phone, tablet, and desktop.",
      <BlogHeading key="h-physical">Interactions in the physical world</BlogHeading>,
      <BlogFigure
        key="physical"
        src={`${MICRO_MEDIA}04-physical-world.png`}
        alt="Everyday physical products designed around touch and sound"
      />,
      "We feed on our senses to know how a certain thing functions. We touch, feel, hear, and see countless products every day, but we often overlook how well-designed they are. It's only when something goes wrong that we notice the little details we usually take for granted.",
      "And it's not just about function — micro-interactions can also add a layer of socio-economic meaning to a product's design. The way something feels or responds can signal quality, status, or even a brand's identity.",
      "Car manufacturers, especially BMW, invest in the sound and feel of door closings. The “good door closing sound” is engineered to convey quality to our brains. Every tactile touchpoint — the resistance in control knobs, the weight of buttons, the sound of turn signals — is meticulously designed around research into human perception and expectation.",
      "The way a door handle responds to touch is another example of careful engineering. A well-designed handle gives immediate tactile feedback: a subtle resistance, followed by a smooth click. These interactions become so familiar that any deviation, like a loose handle, is instantly noticeable.",
      "The Apple AirPods Pro case is another instance of sophisticated design. When you close the case, the precise magnetic pull, paired with digital feedback — a sound and a haptic buzz on your iPhone — confirms the case is closed and charging. It makes a simple interaction feel complete and satisfying.",
      <BlogHeading key="h-daily">Daily life made fun: apps I use every day</BlogHeading>,
      "Let me walk you through a day in my life where these tiny moments make all the difference, and where micro-interactions aid visual storytelling.",
      <BlogHeading key="s-uber" sub>1. Uber</BlogHeading>,
      <BlogFigure
        key="uber"
        src={`${MICRO_MEDIA}05-uber.png`}
        alt="Uber's live car-location tracking on the lock screen"
        caption="Uber's car-location micro-interaction"
      />,
      "I love how the Uber app lets me track my ride right from my phone's lock screen. Without unlocking, I can see my driver's ETA and car model, and watch the car move toward me in real time. It's a small but thoughtful feature that keeps me in the loop and eases the anxiety of waiting for a pickup.",
      <BlogHeading key="s-coc" sub>2. Clash of Clans</BlogHeading>,
      "My latest obsession is Clash of Clans. Everything feels like it's in exactly the right place. The interaction that's caught my eye is the “searching for an opponent” screen. What could have been a boring loading state is turned into a moment of anticipation that reveals your opponent's base, with multi-layered cloud movement adding depth and drama to what is essentially a waiting period. It's a brilliant example of turning technical necessity into a narrative opportunity.",
      <BlogHeading key="s-lens" sub>3. Google Lens</BlogHeading>,
      "Pinterest and Instagram are full of “what's that?” moments. Finding answers used to mean digging through links or comments. Now, tapping the Google Lens icon on an image instantly surfaces product details, the location of a place, brands, and prices. A few taps turn a frustrating search into instant discovery.",
      <BlogHeading key="s-spotify" sub>4. Spotify's controversial change</BlogHeading>,
      <BlogFigure
        key="spotify"
        src={`${MICRO_MEDIA}06-spotify.png`}
        alt="Spotify's shift from a heart icon to a plus icon for saving songs"
        caption="Spotify's redesign of the “liked song” micro-interaction"
      />,
      "Not all micro-interaction changes are celebrated. When Spotify replaced its heart icon with a plus sign for saving songs, it broke a familiar pattern that users like me had grown to love. The new interaction, while technically functional, lacks the emotional resonance of the heart animation. It's a reminder that micro-interactions aren't just about function — they're about feeling.",
      <BlogHeading key="s-asana" sub>5. Asana</BlogHeading>,
      "Asana's animation of a mythical creature flying across your screen when you check off a task is a great example of design that delights. It makes a simple task feel rewarding and gives you a sense of accomplishment.",
      <BlogHeading key="h-decisions">Micro-interactions drive big decisions</BlogHeading>,
      <BlogFigure
        key="decisions"
        src={`${MICRO_MEDIA}07-big-decisions.png`}
        alt="How teams research and test micro-interactions"
      />,
      "Companies didn't stumble on these ideas — they observed how we use their apps, tested things out, and made changes that felt intuitive. Small details, like a button animation or a gesture, can completely change how people engage with a product. Big companies make these changes by combining data-driven insights, user feedback, and a deep understanding of behavioural psychology. Here's how they typically spot the need for change:",
      <BlogHeading key="d-analytics" sub>1. User behaviour analytics</BlogHeading>,
      "Analytics tools like Google Analytics, Mixpanel, or Amplitude track how users interact with an app. Metrics such as bounce rate, time spent, conversion rate, and feature adoption reveal where users drop off or struggle. Facebook's Like button came from exactly this: behaviour analysis showed people wanted a quick way to acknowledge posts without commenting, which later grew into “Haha,” “Love,” and the rest of the reactions.",
      <BlogFigure
        key="fb"
        src={`${MICRO_MEDIA}08-facebook-reactions.gif`}
        alt="Facebook emoji reactions animating out from the Like button"
        caption="Emoji reactions on Facebook"
      />,
      <BlogHeading key="d-abtest" sub>2. A/B testing</BlogHeading>,
      "Companies run A/B and multivariate tests to compare versions of a design — button animations, haptic feedback, progress indicators — to see which drives higher engagement or satisfaction. Instagram's double-tap to like likely went through this kind of testing to confirm it was intuitive and that it lifted likes compared with a dedicated button.",
      <BlogFigure
        key="ig"
        src={`${MICRO_MEDIA}09-instagram-like.gif`}
        alt="Instagram's double-tap-to-like heart animation"
        caption="Instagram's double-tap like"
      />,
      <BlogHeading key="d-feedback" sub>3. User feedback</BlogHeading>,
      "App reviews, surveys, and interviews often reveal what feels clunky or confusing. Headspace added breathing animations and haptic feedback synced to guided meditations after users asked for more immersive mindfulness experiences.",
      <BlogFigure
        key="headspace"
        src={`${MICRO_MEDIA}10-headspace.gif`}
        alt="Headspace's expanding-and-contracting breathing animation"
        caption="Breathing animation on Headspace"
      />,
      <BlogHeading key="d-competitor" sub>4. Competitor analysis</BlogHeading>,
      "Watching competitor apps helps teams spot successful patterns. Inspired by gamification in apps like Duolingo, LinkedIn added a profile-completion progress bar to nudge users toward finishing their profiles.",
      <BlogFigure
        key="linkedin"
        src={`${MICRO_MEDIA}11-linkedin.png`}
        alt="LinkedIn's profile-completion progress bar"
        caption="LinkedIn's profile progress bar"
      />,
      <BlogHeading key="d-usability" sub>5. Usability testing</BlogHeading>,
      "Watching real users interact with an app in real time surfaces pain points and places where people expect feedback but don't get it. Slack's typing indicators and playful animations came out of testing that showed they create a better sense of real-time collaboration.",
      <BlogFigure
        key="slack"
        src={`${MICRO_MEDIA}12-slack.png`}
        alt="Slack's typing indicator"
        caption="Slack's typing indicator"
      />,
      <BlogHeading key="h-human">Why micro-interactions matter: they make tech feel human</BlogHeading>,
      <BlogFigure
        key="conclusion"
        src={`${MICRO_MEDIA}13-conclusion.png`}
        alt="A quiet reminder that small moments add up"
      />,
      "As a designer, I'm reminded that great experiences aren't built on grand gestures but on countless thoughtful details. Each one is a chance to make technology feel more human, more responsive, and more delightful.",
      "When I design interfaces now, I think about how each micro-interaction, however small, contributes to the user's story. Because ultimately that's what we're designing — not just interfaces, but moments that make up the stories of people's daily lives.",
      "The next time you notice a micro-interaction, remember: you're experiencing the subtle symphony of intentional design that surrounds us. After all, life itself is made up of small moments — and our designs should celebrate them too.",
      <span
        key="source"
        className="font-inclusive-sans"
        style={{ display: "block", fontSize: 13, lineHeight: "20px", color: "#625e37", opacity: 0.7, marginTop: 8 }}
      >
        Originally published with Canvs Editorial —{" "}
        <a
          href="https://medium.com/canvs/the-tactile-charm-of-micro-interactions-056747c4f615"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#625e37", textDecorationThickness: "1px", textUnderlineOffset: 2 }}
        >
          read the original
        </a>
        .
      </span>,
    ],
  },
];
