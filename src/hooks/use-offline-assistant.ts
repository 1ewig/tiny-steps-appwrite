import type { Step, GranularityLevel } from '@/types/task';

interface BreakdownResult {
  dialogue: string;
  title: string;
  steps: Step[];
}

const PRESETS = {
  desk: {
    title: "Clear my messy desk",
    dialogue: "I totally understand. Desks gather clutter so fast and looking at the whole thing makes your mind buzz. Let's not clean the entire desk—let's just clear a tiny pocket of breathing room.",
    levels: {
      1: [
        { text: "Grab any dishes, mugs, or wrappers and take them to the kitchen", effort: "~2 min" },
        { text: "Toss obvious trash or scraps into a bin", effort: "~1 min" },
        { text: "Stack loose papers and notebooks into one neat pile", effort: "~2 min" },
        { text: "Wipe down the open surface in front of your keyboard", effort: "~1 min" }
      ],
      2: [
        { text: "Take one deep breath and look only at the left corner of your desk", effort: "10 sec" },
        { text: "Pick up just the empty cups or mugs and set them near the door", effort: "~1 min" },
        { text: "Throw away 3 pieces of trash you can see right now", effort: "~1 min" },
        { text: "Put pens and small items into a single container or corner", effort: "~1 min" },
        { text: "Clear a clean spot just big enough for your hands and laptop", effort: "~1 min" }
      ],
      3: [
        { text: "Exhale slowly. You do not have to clean the whole desk today.", effort: "5 sec" },
        { text: "Touch just ONE item on your desk that belongs in the trash", effort: "10 sec" },
        { text: "Drop that single item into the bin", effort: "15 sec" },
        { text: "Move any cups or dishes to the edge of the desk", effort: "30 sec" },
        { text: "Push everything else slightly back so you have 6 inches of breathing room", effort: "30 sec" }
      ]
    }
  },
  email: {
    title: "Reply to an overdue email",
    dialogue: "Email paralysis is so real. The guilt of replying late makes it 10x harder than it actually is. Remember: a messy, late reply is 100x better than radio silence.",
    levels: {
      1: [
        { text: "Open your inbox and search for the message", effort: "~1 min" },
        { text: "Read what they actually asked for (ignore the guilt)", effort: "~1 min" },
        { text: "Write a rough, imperfect 2-sentence reply", effort: "~2 min" },
        { text: "Hit send and immediately close the tab", effort: "10 sec" }
      ],
      2: [
        { text: "Remind yourself: nobody is angry at you; people get busy", effort: "10 sec" },
        { text: "Open the message without pressure to reply yet", effort: "30 sec" },
        { text: "Type 'Hi! Sorry for the delay—' in the reply box", effort: "20 sec" },
        { text: "Answer their main question in one plain sentence", effort: "~1 min" },
        { text: "Press send without re-reading it 5 times", effort: "10 sec" }
      ],
      3: [
        { text: "Unclench your shoulders and unclench your jaw", effort: "10 sec" },
        { text: "Open a blank note (not your email yet) so it feels safe", effort: "15 sec" },
        { text: "Type one messy sentence saying what you need to tell them", effort: "~1 min" },
        { text: "Open the actual message and paste that sentence in", effort: "30 sec" },
        { text: "Click send and take a sip of water", effort: "15 sec" }
      ]
    }
  },
  laundry: {
    title: "Deal with the laundry pile",
    dialogue: "The laundry monster is intimidating because we picture washing, drying, folding, and putting away all at once. We're only doing 2% of it today.",
    levels: {
      1: [
        { text: "Gather clothes from the floor/chair into one basket", effort: "~2 min" },
        { text: "Carry the basket to the washing machine", effort: "~1 min" },
        { text: "Toss one load in, add detergent, and press start", effort: "~2 min" }
      ],
      2: [
        { text: "Place your laundry basket in the middle of the room", effort: "20 sec" },
        { text: "Pick up just 5 pieces of clothing and toss them in", effort: "~1 min" },
        { text: "Toss the rest of the obvious pile into the basket", effort: "~1 min" },
        { text: "Set the basket by the door or washer", effort: "30 sec" },
        { text: "Load the washer and press start", effort: "~1 min" }
      ],
      3: [
        { text: "Stand up and stretch your arms for 5 seconds", effort: "5 sec" },
        { text: "Pick up just ONE shirt or pair of socks from the floor", effort: "10 sec" },
        { text: "Put it into the hamper or basket", effort: "10 sec" },
        { text: "Grab 3 more easy items and drop them in too", effort: "30 sec" },
        { text: "Slide the basket closer to the door—you have permission to stop right here", effort: "20 sec" }
      ]
    }
  },
  braindump: {
    title: "Calm the storm",
    dialogue: "That is a huge cognitive load to hold in your working memory! No wonder you're frozen. Your brain is trying to solve all problems simultaneously. Let's park the chaos and only look at 1 tiny starter action.",
    levels: {
      1: [
        { text: "Write down the single most urgent fire on a scrap of paper", effort: "~1 min" },
        { text: "Do the first 3-minute mechanical action for that fire", effort: "~3 min" },
        { text: "Check it off and breathe before picking the next one", effort: "~1 min" }
      ],
      2: [
        { text: "Take one slow breath in and a long exhale", effort: "10 sec" },
        { text: "Pick the ONE task that is easiest (not the most important—the easiest)", effort: "30 sec" },
        { text: "Set a timer for just 2 minutes and touch only that task", effort: "2 min" },
        { text: "Stop when the timer rings. Momentum is officially unlocked.", effort: "10 sec" }
      ],
      3: [
        { text: "Put both feet flat on the floor. You don't have to fix everything today.", effort: "10 sec" },
        { text: "Drink three slow sips of cold water", effort: "20 sec" },
        { text: "Pick just ONE object or tab related to your work and open it", effort: "30 sec" },
        { text: "Do 30 seconds of work on it, then take a deep breath", effort: "30 sec" }
      ]
    }
  }
};

export function useOfflineAssistant() {
  const decomposeTask = (input: string, level: GranularityLevel): BreakdownResult => {
    const clean = input.trim();
    const lower = clean.toLowerCase();

    // Match presets
    if (lower.includes('desk') || lower.includes('table') || lower.includes('room clean')) {
      return {
        dialogue: PRESETS.desk.dialogue,
        title: PRESETS.desk.title,
        steps: PRESETS.desk.levels[level].map((s, i) => ({
          id: Date.now() + i,
          text: s.text,
          effort: s.effort,
          completed: false,
          canSplit: true
        }))
      };
    }

    if (lower.includes('email') || lower.includes('message') || lower.includes('reply') || lower.includes('text') || lower.includes('dread')) {
      return {
        dialogue: PRESETS.email.dialogue,
        title: PRESETS.email.title,
        steps: PRESETS.email.levels[level].map((s, i) => ({
          id: Date.now() + i,
          text: s.text,
          effort: s.effort,
          completed: false,
          canSplit: true
        }))
      };
    }

    if (lower.includes('laundry') || lower.includes('clothes') || lower.includes('wash')) {
      return {
        dialogue: PRESETS.laundry.dialogue,
        title: PRESETS.laundry.title,
        steps: PRESETS.laundry.levels[level].map((s, i) => ({
          id: Date.now() + i,
          text: s.text,
          effort: s.effort,
          completed: false,
          canSplit: true
        }))
      };
    }

    if (lower.includes('10 things') || lower.includes('overwhelmed') || lower.includes('frozen') || lower.includes('stuck') || lower.includes('paralysis') || lower.includes('too much')) {
      return {
        dialogue: PRESETS.braindump.dialogue,
        title: PRESETS.braindump.title,
        steps: PRESETS.braindump.levels[level].map((s, i) => ({
          id: Date.now() + i,
          text: s.text,
          effort: s.effort,
          completed: false,
          canSplit: true
        }))
      };
    }

    // Dynamic heuristic breakdown for any custom input
    const actionName = clean.length > 40 ? clean.substring(0, 37) + '...' : clean;

    if (level === 1) {
      return {
        dialogue: `Let's make quick work of "${actionName}". We don't have to finish the whole thing flawlessly—let's just get the initial friction out of the way.`,
        title: actionName,
        steps: [
          { id: Date.now() + 1, text: `Gather only what you need to start "${actionName}"`, effort: "~1 min", completed: false, canSplit: true },
          { id: Date.now() + 2, text: `Do the easiest, most mechanical 2-minute part`, effort: "~2 min", completed: false, canSplit: true },
          { id: Date.now() + 3, text: `Spend 5 gentle minutes chipping away—rough draft is great`, effort: "~5 min", completed: false, canSplit: true },
          { id: Date.now() + 4, text: `Reach a safe stopping point, bookmark it, and celebrate`, effort: "~1 min", completed: false, canSplit: true }
        ]
      };
    } else if (level === 2) {
      return {
        dialogue: `I hear you. "${actionName}" is carrying a lot of weight right now. Let's not look at the summit of the mountain—let's just put one foot forward on level ground.`,
        title: actionName,
        steps: [
          { id: Date.now() + 1, text: `Take one slow breath and let your shoulders drop`, effort: "10 sec", completed: false, canSplit: true },
          { id: Date.now() + 2, text: `Open the app, notebook, or room where "${actionName}" happens`, effort: "30 sec", completed: false, canSplit: true },
          { id: Date.now() + 3, text: `Set up just the very first piece (don't start the hard part yet)`, effort: "~1 min", completed: false, canSplit: true },
          { id: Date.now() + 4, text: `Do just 60 seconds of gentle, imperfect action`, effort: "~1 min", completed: false, canSplit: true },
          { id: Date.now() + 5, text: `Check in with yourself—you can stop here or keep rolling`, effort: "~1 min", completed: false, canSplit: true }
        ]
      };
    } else {
      return {
        dialogue: `Breathe. You are safe. You do not have to finish "${actionName}" today. In fact, doing just 1% of this task is a 100% complete victory. Here is your microscopic permission slip:`,
        title: actionName,
        steps: [
          { id: Date.now() + 1, text: `Exhale slowly. You only have to do 10 seconds of physical motion right now.`, effort: "5 sec", completed: false, canSplit: true },
          { id: Date.now() + 2, text: `Put both feet flat on the floor or sit comfortably`, effort: "10 sec", completed: false, canSplit: true },
          { id: Date.now() + 3, text: `Just LOOK at or open the place where "${actionName}" lives (zero pressure to work)`, effort: "15 sec", completed: false, canSplit: true },
          { id: Date.now() + 4, text: `Touch or type just the very first word or object involved`, effort: "20 sec", completed: false, canSplit: true },
          { id: Date.now() + 5, text: `Spend 30 seconds on the easiest piece, then you have permission to stop completely`, effort: "30 sec", completed: false, canSplit: true }
        ]
      };
    }
  };

  return { decomposeTask };
}
