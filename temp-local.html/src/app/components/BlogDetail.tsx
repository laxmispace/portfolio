import { useRef, useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

export type BlogCategory = "write about design" | "personal musings" | "life in a nutshell";

export interface BlogPost {
  id: number;
  date: string;
  readTime: string;
  title: string;
  subtitle: string;
  body: ReactNode[];
  category: BlogCategory;
}

const CHIPS: BlogCategory[] = ["write about design", "personal musings", "life in a nutshell"];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 3,
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
    id: 0,
    date: "Mar 2024",
    readTime: "5 min read",
    category: "write about design",
    title: "Why most design systems fail silently",
    subtitle: "Building components is the easy part. Getting teams to actually use them is the whole game.",
    body: [
      "Design systems are sold as the silver bullet — build once, use everywhere, maintain sanity. And yet, three years into running the design system at a fintech, I watched it quietly collect dust. The components were good. The documentation was thorough. Nobody used it.",
      "The failure wasn't technical. It was cultural. Design systems don't fail because the tokens are wrong or the spacing grid is off. They fail because no one owns the contract between the system and the teams consuming it.",
      "What I learned: a design system is a product, not a library. It needs a roadmap, a support channel, office hours, and champions inside each product team. Without that infrastructure, even the most technically elegant system becomes shelfware.",
      "The teams that succeeded had one thing in common: someone whose job it was to make the system easy to adopt. Not just easy to use — easy to adopt. Those are different problems. Adoption is about trust, communication, and reducing the friction of change. Usage is about API design and documentation.",
      "If you're starting a design system, hire for adoption first. The engineering can always be refactored. The culture cannot.",
    ],
  },
  {
    id: 1,
    date: "Jan 2024",
    readTime: "4 min read",
    category: "write about design" as BlogCategory,
    title: "The case for designing in production",
    subtitle: "Prototypes lie. Real data doesn't. Here's why I stopped perfecting Figma files and started shipping.",
    body: [
      "Figma is where ideas go to feel finished before they're ready. I've spent hundreds of hours pixel-pushing prototypes that felt airtight in review and fell apart the moment they hit real users with real data.",
      "The problem is that prototypes are optimistic. You design for the happy path with clean data, ideal string lengths, and a cooperative user who reads every word. Reality is messier.",
      "I started advocating for shorter fidelity cycles — rough wireframes straight into staging, with real API data, real error states, real empty states. The feedback loops got faster. The surprises got smaller.",
      "This isn't an argument against prototyping. High-fidelity exploration still has its place, especially for complex interactions where the cost of getting it wrong in code is high. But the default shouldn't be 'finish the prototype'. It should be 'what's the cheapest way to learn if this direction is right?'",
      "The best design tool I have right now is a browser with DevTools open and a production dataset. That's where the real design work happens.",
    ],
  },
  {
    id: 2,
    date: "Nov 2023",
    readTime: "6 min read",
    category: "personal musings" as BlogCategory,
    title: "On designing for anxiety",
    subtitle: "Financial products live and die on trust. Here's what two years in fintech taught me about designing for high-stakes moments.",
    body: [
      "Every interaction in a banking app is a high-stakes moment. People aren't casually scrolling — they're checking if their rent cleared, seeing if they have enough for groceries, watching their savings inch toward a goal that feels impossibly far away.",
      "The emotional weight of money is something most financial product teams I've worked with significantly underestimate. The UX review is about clarity and efficiency. It rarely asks: what is the user feeling right now, and what do they need to feel instead?",
      "Anxiety drives bad decisions. When people feel uncertain, they either over-act (obsessively refreshing balances) or freeze (avoiding the app entirely). Good financial UX reduces uncertainty. It gives people the minimum information they need to feel in control, at the moment they need it.",
      "The most impactful change I made to the ICICI onboarding flow wasn't a visual redesign — it was adding a single progress indicator that showed users exactly where they were in the KYC process. Completion rates went up. Support tickets about 'what happens next' dropped by 40%.",
      "Designing for anxiety means designing for the emotional journey, not just the task. What does a person feel at this step? What do they fear? What would make them feel safe enough to continue? Answer those questions and the visual design almost solves itself.",
    ],
  },
];

interface BlogDetailProps {
  open: boolean;
  onClose: () => void;
}

function PostCard({
  post,
  onClick,
  active,
}: {
  post: BlogPost;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ backgroundColor: "rgba(33,32,18,0.06)" }}
      style={{
        padding: "20px 0",
        borderBottom: "1px solid rgba(33,32,18,0.1)",
        cursor: "pointer",
        borderRadius: 8,
        transition: "background 0.15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <p className="font-jakarta" style={{ fontSize: 12, color: "#625e37", opacity: 0.7 }}>
            {post.date}
          </p>
          <p className="font-jakarta" style={{ fontSize: 12, color: "#625e37", opacity: 0.5 }}>
            {post.readTime}
          </p>
        </div>
        {active && (
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#625e37",
              flexShrink: 0,
              marginTop: 4,
            }}
          />
        )}
      </div>
      <p
        className="font-caslon not-italic"
        style={{ fontSize: 22, lineHeight: "28px", color: "#212012", fontWeight: 600, marginBottom: 6 }}
      >
        {post.title}
      </p>
      <p
        className="font-jakarta"
        style={{ fontSize: 14, lineHeight: "20px", color: "#625e37", opacity: 0.8 }}
      >
        {post.subtitle}
      </p>
    </motion.div>
  );
}

function PostBody({ post }: { post: BlogPost }) {
  return (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ paddingBottom: 80 }}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <p className="font-jakarta" style={{ fontSize: 12, color: "#625e37", opacity: 0.7 }}>
            {post.date}
          </p>
          <p className="font-jakarta" style={{ fontSize: 12, color: "#625e37", opacity: 0.5 }}>
            {post.readTime}
          </p>
        </div>
        <p
          className="font-caslon not-italic"
          style={{ fontSize: 32, lineHeight: "40px", color: "#212012", fontWeight: 600, marginBottom: 12 }}
        >
          {post.title}
        </p>
        <p
          className="font-jakarta"
          style={{ fontSize: 16, lineHeight: "24px", color: "#625e37" }}
        >
          {post.subtitle}
        </p>
      </div>

      <div
        style={{
          height: 1,
          backgroundColor: "rgba(33,32,18,0.1)",
          marginBottom: 32,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {post.body.map((para, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="font-jakarta"
            style={{ fontSize: 16, lineHeight: "28px", color: "#212012", opacity: 0.85 }}
          >
            {para}
          </motion.p>
        ))}
      </div>

      <div
        style={{
          marginTop: 48,
          padding: "24px 0",
          borderTop: "1px solid rgba(33,32,18,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "#c3be6f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <p className="font-caslon" style={{ fontSize: 14, color: "#212012", fontWeight: 600 }}>
            L
          </p>
        </div>
        <div>
          <p className="font-jakarta font-semibold" style={{ fontSize: 14, color: "#212012" }}>
            Laxmi Mahajan
          </p>
          <p className="font-jakarta" style={{ fontSize: 12, color: "#625e37", opacity: 0.7 }}>
            UX designer · Bangalore
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function BlogDetail({ open, onClose }: BlogDetailProps) {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeChip, setActiveChip] = useState<BlogCategory | null>(null);

  useEffect(() => {
    if (!open) {
      setActivePost(null);
      setScrolled(false);
      setActiveChip(null);
    }
  }, [open]);

  const filteredPosts = activeChip ? BLOG_POSTS.filter((p) => p.category === activeChip) : BLOG_POSTS;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(33,32,18,0.35)",
              backdropFilter: "blur(4px)",
              zIndex: 100,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: 780,
              backgroundColor: "#e3d9ce",
              borderRadius: "24px 0 0 24px",
              zIndex: 101,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "rgba(33,32,18,0.08)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(33,32,18,0.14)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(33,32,18,0.08)")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="#212012" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* Sticky header */}
            <motion.div
              animate={{ height: scrolled ? 56 : 80 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "flex-end",
                padding: "0 32px 16px",
                borderBottom: "1px solid rgba(33,32,18,0.08)",
                backgroundColor: "#e3d9ce",
                position: "relative",
                zIndex: 2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {activePost && (
                  <motion.button
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setActivePost(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8L10 13" stroke="#625e37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="font-jakarta" style={{ fontSize: 13, color: "#625e37" }}>
                      all posts
                    </p>
                  </motion.button>
                )}
                <motion.p
                  className="font-caslon not-italic"
                  animate={{ fontSize: scrolled ? 18 : 24 }}
                  transition={{ duration: 0.25 }}
                  style={{ color: "#212012", fontWeight: 600, lineHeight: "normal" }}
                >
                  {activePost ? activePost.title : "i write, sometimes"}
                </motion.p>
              </div>
            </motion.div>

            {/* Scrollable content */}
            <div
              ref={scrollableRef}
              onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 20)}
              style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}
            >
              <style>{`.blog-scroll::-webkit-scrollbar { display: none; }`}</style>

              {activePost ? (
                <div style={{ padding: "32px 32px 0" }}>
                  <PostBody post={activePost} />
                </div>
              ) : (
                <div style={{ padding: "8px 32px 80px" }}>
                  {/* Category chips */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "16px 0 4px" }}>
                    {CHIPS.map((chip) => (
                      <motion.button
                        key={chip}
                        onClick={() => setActiveChip(activeChip === chip ? null : chip)}
                        whileHover={{ opacity: 1 }}
                        style={{
                          background: activeChip === chip ? "#625e37" : "rgba(98,94,55,0.1)",
                          border: "none",
                          borderRadius: 20,
                          padding: "5px 12px",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                      >
                        <p
                          className="font-jakarta font-medium"
                          style={{
                            fontSize: 11,
                            color: activeChip === chip ? "#e3d9ce" : "#625e37",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {chip}
                        </p>
                      </motion.button>
                    ))}
                  </div>

                  <p
                    className="font-jakarta"
                    style={{ fontSize: 12, color: "#625e37", opacity: 0.5, padding: "12px 0 4px" }}
                  >
                    {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
                    {activeChip ? ` in "${activeChip}"` : " · opinions on design, systems and fintech"}
                  </p>

                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => {
                        setActivePost(post);
                        scrollableRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      active={activePost?.id === post.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
