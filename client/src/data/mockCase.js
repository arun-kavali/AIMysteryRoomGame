/**
 * Mock case data matching UI reference image and SPEC.md rules.
 * This mock data is strictly separated from components to allow seamless Phase 2/3 replacement.
 */

export const INITIAL_MOCK_CASE = {
  id: "case_diamond_001",
  title: "The Stolen Diamond",
  difficulty: "medium",
  premise: "A priceless diamond was stolen from a locked museum during a storm.",
  story: "A priceless diamond was stolen from the museum during a storm. Four people had access to the museum. Each has a motive, an alibi, and something to hide. Can you identify the thief?",
  status: "active", // 'active' | 'completed'
  createdAt: "2026-10-28T20:00:00.000Z",
  
  suspects: [
    {
      id: "suspect_1",
      name: "Emma Carter",
      role: "Curator",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256",
      motive: "Money",
      alibi: "In office",
      description: "Head curator with deep knowledge of museum security and mounting personal debts.",
      details: "Emma had access to security override logs. She claims she was finalizing the quarterly budget behind closed doors."
    },
    {
      id: "suspect_2",
      name: "Jack Wilson",
      role: "Security Guard",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256",
      motive: "Revenge",
      alibi: "On duty",
      description: "Night guard passed over for promotion; claims he was patrolling the north wing.",
      details: "Jack's badge was scanned at the north stairwell 10 minutes prior to the blackout."
    },
    {
      id: "suspect_3",
      name: "Sophia Lee",
      role: "Art Dealer",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256",
      motive: "Fame",
      alibi: "At event",
      description: "High-profile art dealer seen visiting private vaults earlier that evening.",
      details: "Sophia represents private collectors who would pay fortunes for uncatalogued rarities."
    },
    {
      id: "suspect_4",
      name: "Daniel Brooks",
      role: "Conservator",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
      motive: "Possession",
      alibi: "At home",
      description: "Skilled restoration expert with keycard access to the display case locks.",
      details: "Daniel possesses specialized glass-cutting instruments and master restoration keys."
    }
  ],

  clues: [
    {
      id: "clue_1",
      clueNumber: 1,
      title: "Security Camera Glitch",
      description: "Camera footage loops for exactly 4 minutes at 11:42 PM, masking the display hall.",
      discovered: true,
      points: 5,
      type: "Digital Forensic",
      location: "Control Room",
      relatedSuspects: ["Jack Wilson"]
    },
    {
      id: "clue_2",
      clueNumber: 2,
      title: "Torn Note",
      description: "A torn piece of paper was found near the museum's back entrance. It contains a partial message and a name.",
      noteExcerpt: "Meet me at the old warehouse ...\n- D",
      image: "https://images.unsplash.com/photo-1583521214690-73421a1829a9?auto=format&fit=crop&q=80&w=600",
      discovered: true,
      points: 5,
      type: "Written Evidence",
      location: "Museum Back Entrance",
      relatedSuspects: ["Daniel Brooks", "Sophia Lee"]
    },
    {
      id: "clue_3",
      clueNumber: 3,
      title: "Muddy Footprints",
      description: "Size 10 boots leaving traces of harbor clay near the side exit matching restoration work boots.",
      discovered: true,
      points: 5,
      type: "Physical Evidence",
      location: "Storage Exit",
      relatedSuspects: ["Daniel Brooks"]
    },
    {
      id: "clue_4",
      clueNumber: 4,
      title: "Missing Master Key",
      description: "The duplicate glass display key was removed from the curator's private safe before the storm.",
      discovered: false,
      points: 5,
      type: "Access Log",
      location: "Curator Office",
      relatedSuspects: ["Emma Carter"]
    },
    {
      id: "clue_5",
      clueNumber: 5,
      title: "Encrypted Text Message",
      description: "Message sent from museum premises: 'Package secured. Bring the buyer to warehouse 4.'",
      discovered: false,
      points: 5,
      type: "Communication",
      location: "Cell Tower Logs",
      relatedSuspects: ["Daniel Brooks", "Sophia Lee"]
    },
    {
      id: "clue_6",
      clueNumber: 6,
      title: "Warehouse Lease Agreement",
      description: "A lease registered under a numbered company with Daniel Brooks listed as emergency contact.",
      discovered: false,
      points: 5,
      type: "Documentary",
      location: "Harbor District",
      relatedSuspects: ["Daniel Brooks"]
    },
    {
      id: "clue_7",
      clueNumber: 7,
      title: "Jeweler's Loupe",
      description: "A professional 30x optical loupe found tucked under the velvet display pedestal.",
      discovered: false,
      points: 5,
      type: "Physical Evidence",
      location: "Display Pedestal",
      relatedSuspects: ["Daniel Brooks"]
    }
  ],

  hints: [
    {
      id: "hint_1",
      number: 1,
      text: "Think about who had a financial motive.",
      unlocked: true
    },
    {
      id: "hint_2",
      number: 2,
      text: "Look at the timing of the alibis.",
      unlocked: false
    },
    {
      id: "hint_3",
      number: 3,
      text: "There's a connection between the museum and the warehouse.",
      unlocked: false
    }
  ],

  solution: {
    culpritSuspectId: "suspect_4",
    culpritName: "Daniel Brooks",
    culpritRole: "Conservator",
    culpritAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
    explanation: "Daniel Brooks had both the motive and opportunity. The torn note, his connection to the warehouse, and the timing of his alibi all pointed to him. He used his access to the museum's storage area to steal the diamond and planned to sell it through the old warehouse contact.",
    basePoints: 150
  }
};

