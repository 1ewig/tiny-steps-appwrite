import type { GranularityLevel } from '@/types/task';

export interface PresetStep {
  text: string;
  effort: string;
  hint?: string;
}

export interface PresetItem {
  title: string;
  dialogue: string;
  levels: Record<GranularityLevel, PresetStep[]>;
}

export const PRESETS: Record<'desk' | 'email' | 'laundry' | 'braindump', PresetItem> = {
  desk: {
    title: 'Clear my messy desk',
    dialogue:
      "I totally understand. Desks gather clutter so fast and looking at the whole thing makes your mind buzz. Let's not clean the entire desk—let's just clear a tiny pocket of breathing room.",
    levels: {
      1: [
        {
          text: 'Grab any dishes, mugs, or wrappers and take them to the kitchen',
          effort: '~2 min',
          hint: 'Only the obvious dishes and wrappers—no sorting yet.',
        },
        {
          text: 'Toss obvious trash or scraps into a bin',
          effort: '~1 min',
          hint: "If you have to decide whether it's trash, leave it.",
        },
        {
          text: 'Stack loose papers and notebooks into one neat pile',
          effort: '~2 min',
          hint: 'One stack is enough. No filing, no sorting.',
        },
        {
          text: 'Wipe down the open surface in front of your keyboard',
          effort: '~1 min',
          hint: 'Just the area in front of you—the rest can wait.',
        },
      ],
      2: [
        {
          text: 'Take one deep breath and look only at the left corner of your desk',
          effort: '10 sec',
          hint: "Let your eyes rest there. You don't have to move anything yet.",
        },
        {
          text: 'Pick up just the empty cups or mugs and set them near the door',
          effort: '~1 min',
          hint: "Carry them one at a time if that's easier.",
        },
        {
          text: 'Throw away 3 pieces of trash you can see right now',
          effort: '~1 min',
          hint: 'Three is the whole goal. Stop after three.',
        },
        {
          text: 'Put pens and small items into a single container or corner',
          effort: '~1 min',
          hint: 'A mug or a corner counts as a container.',
        },
        {
          text: 'Clear a clean spot just big enough for your hands and laptop',
          effort: '~1 min',
          hint: 'Six inches is enough breathing room.',
        },
      ],
      3: [
        {
          text: 'Exhale slowly. You do not have to clean the whole desk today.',
          effort: '5 sec',
          hint: 'This step is the whole task right now.',
        },
        {
          text: 'Touch just ONE item on your desk that belongs in the trash',
          effort: '10 sec',
          hint: 'Just touch it. You can stop there if you need to.',
        },
        {
          text: 'Drop that single item into the bin',
          effort: '15 sec',
          hint: "One movement. That's it.",
        },
        {
          text: 'Move any cups or dishes to the edge of the desk',
          effort: '30 sec',
          hint: 'Edge of the desk is fine—not the kitchen.',
        },
        {
          text: 'Push everything else slightly back so you have 6 inches of breathing room',
          effort: '30 sec',
          hint: 'Your hands and eyes get space. Done.',
        },
      ],
    },
  },
  email: {
    title: 'Reply to an overdue email',
    dialogue:
      'Email paralysis is so real. The guilt of replying late makes it 10x harder than it actually is. Remember: a messy, late reply is 100x better than radio silence.',
    levels: {
      1: [
        {
          text: 'Open your inbox and search for the message',
          effort: '~1 min',
          hint: "Don't read the whole inbox—just find this one message.",
        },
        {
          text: 'Read what they actually asked for (ignore the guilt)',
          effort: '~1 min',
          hint: 'Ignore tone and timing. Look for the one question.',
        },
        {
          text: 'Write a rough, imperfect 2-sentence reply',
          effort: '~2 min',
          hint: 'No greeting, no apology essay. Two sentences.',
        },
        {
          text: 'Hit send and immediately close the tab',
          effort: '10 sec',
          hint: "Close the tab immediately. Don't re-read.",
        },
      ],
      2: [
        {
          text: 'Remind yourself: nobody is angry at you; people get busy',
          effort: '10 sec',
          hint: 'People get busy. This is not a verdict on you.',
        },
        {
          text: 'Open the message without pressure to reply yet',
          effort: '30 sec',
          hint: 'Opening is the step. Replying can wait.',
        },
        {
          text: "Type 'Hi! Sorry for the delay—' in the reply box",
          effort: '20 sec',
          hint: "That's it—that's the whole sentence.",
        },
        {
          text: 'Answer their main question in one plain sentence',
          effort: '~1 min',
          hint: 'Plain and imperfect is perfect.',
        },
        {
          text: 'Press send without re-reading it 5 times',
          effort: '10 sec',
          hint: 'One send. No five-pass inspection.',
        },
      ],
      3: [
        {
          text: 'Unclench your shoulders and unclench your jaw',
          effort: '10 sec',
          hint: 'Jaw, shoulders, hands. Let them drop.',
        },
        {
          text: 'Open a blank note (not your email yet) so it feels safe',
          effort: '15 sec',
          hint: 'A blank note is a safe place—not the real email.',
        },
        {
          text: 'Type one messy sentence saying what you need to tell them',
          effort: '~1 min',
          hint: "Messy is the point. Don't polish it.",
        },
        {
          text: 'Open the actual message and paste that sentence in',
          effort: '30 sec',
          hint: 'Copy, paste, done. No editing required.',
        },
        {
          text: 'Click send and take a sip of water',
          effort: '15 sec',
          hint: 'Send, then give your body a small reward.',
        },
      ],
    },
  },
  laundry: {
    title: 'Deal with the laundry pile',
    dialogue:
      "The laundry monster is intimidating because we picture washing, drying, folding, and putting away all at once. We're only doing 2% of it today.",
    levels: {
      1: [
        {
          text: 'Gather clothes from the floor/chair into one basket',
          effort: '~2 min',
          hint: "Only what's visible on the floor or chair.",
        },
        {
          text: 'Carry the basket to the washing machine',
          effort: '~1 min',
          hint: 'Carrying it is the whole step.',
        },
        {
          text: 'Toss one load in, add detergent, and press start',
          effort: '~2 min',
          hint: 'One load. Not all of it.',
        },
      ],
      2: [
        {
          text: 'Place your laundry basket in the middle of the room',
          effort: '20 sec',
          hint: "Put it where you can see it. That's all.",
        },
        {
          text: 'Pick up just 5 pieces of clothing and toss them in',
          effort: '~1 min',
          hint: 'Five is the goal. Count them and stop.',
        },
        {
          text: 'Toss the rest of the obvious pile into the basket',
          effort: '~1 min',
          hint: 'Only the easy, obvious pieces.',
        },
        {
          text: 'Set the basket by the door or washer',
          effort: '30 sec',
          hint: 'Closer is enough—no need to load it yet.',
        },
        {
          text: 'Load the washer and press start',
          effort: '~1 min',
          hint: "Once it starts, you're done with this step.",
        },
      ],
      3: [
        {
          text: 'Stand up and stretch your arms for 5 seconds',
          effort: '5 sec',
          hint: 'Five seconds of movement is a complete win.',
        },
        {
          text: 'Pick up just ONE shirt or pair of socks from the floor',
          effort: '10 sec',
          hint: 'Just one. Nothing else.',
        },
        {
          text: 'Put it into the hamper or basket',
          effort: '10 sec',
          hint: 'One item in. You can stop here.',
        },
        {
          text: 'Grab 3 more easy items and drop them in too',
          effort: '30 sec',
          hint: "Three more, then you're free.",
        },
        {
          text: 'Slide the basket closer to the door—you have permission to stop right here',
          effort: '20 sec',
          hint: 'Permission to stop here is real.',
        },
      ],
    },
  },
  braindump: {
    title: 'Calm the storm',
    dialogue:
      "That is a huge cognitive load to hold in your working memory! No wonder you're frozen. Your brain is trying to solve all problems simultaneously. Let's park the chaos and only look at 1 tiny starter action.",
    levels: {
      1: [
        {
          text: 'Write down the single most urgent fire on a scrap of paper',
          effort: '~1 min',
          hint: 'One fire. Not the whole list.',
        },
        {
          text: 'Do the first 3-minute mechanical action for that fire',
          effort: '~3 min',
          hint: 'Three minutes, mechanical only. No planning.',
        },
        {
          text: 'Check it off and breathe before picking the next one',
          effort: '~1 min',
          hint: 'Pause before picking the next one—if any.',
        },
      ],
      2: [
        {
          text: 'Take one slow breath in and a long exhale',
          effort: '10 sec',
          hint: 'One breath in, one long exhale.',
        },
        {
          text: 'Pick the ONE task that is easiest (not the most important—the easiest)',
          effort: '30 sec',
          hint: 'Easiest, not most important. Trust that.',
        },
        {
          text: 'Set a timer for just 2 minutes and touch only that task',
          effort: '2 min',
          hint: 'Two minutes. You can stop when it rings.',
        },
        {
          text: 'Stop when the timer rings. Momentum is officially unlocked.',
          effort: '10 sec',
          hint: 'Stopping on time is the win.',
        },
      ],
      3: [
        {
          text: "Put both feet flat on the floor. You don't have to fix everything today.",
          effort: '10 sec',
          hint: "You don't have to fix everything today.",
        },
        {
          text: 'Drink three slow sips of cold water',
          effort: '20 sec',
          hint: 'Cold water, three slow sips.',
        },
        {
          text: 'Pick just ONE object or tab related to your work and open it',
          effort: '30 sec',
          hint: 'One tab or one object. Nothing else.',
        },
        {
          text: 'Do 30 seconds of work on it, then take a deep breath',
          effort: '30 sec',
          hint: 'Thirty seconds, then breathe.',
        },
      ],
    },
  },
};
