const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Poll & Vote database with sample data...");

  // Clean existing data
  await prisma.vote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      name: "Alex Morgan",
      email: "alex@example.com",
      password: passwordHash,
      role: "ADMIN",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex"
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Sophia Chen",
      email: "sophia@example.com",
      password: passwordHash,
      role: "USER",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sophia"
    }
  });

  const user3 = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      password: passwordHash,
      role: "USER",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rahul"
    }
  });

  const user4 = await prisma.user.create({
    data: {
      name: "Emma Watson",
      email: "emma@example.com",
      password: passwordHash,
      role: "USER",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Emma"
    }
  });

  // Create Poll 1: Tech Poll (Frontend Frameworks)
  const poll1 = await prisma.poll.create({
    data: {
      title: "What is your primary Frontend Framework for 2026?",
      description: "With modern web evolving rapidly, what is your go-to framework for building interactive user experiences?",
      category: "Technology",
      isPrivate: false,
      isMultiple: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      creatorId: user1.id,
      options: {
        create: [
          { text: "React / Next.js" },
          { text: "Vue.js / Nuxt" },
          { text: "Svelte / SvelteKit" },
          { text: "Angular" }
        ]
      }
    },
    include: { options: true }
  });

  // Vote on Poll 1
  await prisma.vote.create({
    data: { pollId: poll1.id, optionId: poll1.options[0].id, userId: user2.id }
  });
  await prisma.vote.create({
    data: { pollId: poll1.id, optionId: poll1.options[0].id, userId: user3.id }
  });
  await prisma.vote.create({
    data: { pollId: poll1.id, optionId: poll1.options[2].id, userId: user4.id }
  });

  // Create Poll 2: AI & Future (Multiple Choice)
  const poll2 = await prisma.poll.create({
    data: {
      title: "Which AI capabilities do you utilize most frequently?",
      description: "Select all AI developer tools and workflows you rely on weekly.",
      category: "Artificial Intelligence",
      isPrivate: false,
      isMultiple: true,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      creatorId: user2.id,
      options: {
        create: [
          { text: "Code Generation & Refactoring" },
          { text: "Documentation & Technical Writing" },
          { text: "Automated Testing & Bug Hunting" },
          { text: "System Architecture Design" }
        ]
      }
    },
    include: { options: true }
  });

  await prisma.vote.create({
    data: { pollId: poll2.id, optionId: poll2.options[0].id, userId: user1.id }
  });
  await prisma.vote.create({
    data: { pollId: poll2.id, optionId: poll2.options[1].id, userId: user1.id }
  });
  await prisma.vote.create({
    data: { pollId: poll2.id, optionId: poll2.options[0].id, userId: user3.id }
  });
  await prisma.vote.create({
    data: { pollId: poll2.id, optionId: poll2.options[2].id, userId: user3.id }
  });

  // Create Poll 3: Work Culture
  const poll3 = await prisma.poll.create({
    data: {
      title: "What is your ideal work environment setup?",
      description: "Balancing productivity, collaboration, and work-life balance.",
      category: "Career & Work",
      isPrivate: false,
      isMultiple: false,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      creatorId: user3.id,
      options: {
        create: [
          { text: "100% Fully Remote" },
          { text: "Hybrid (2-3 Days in Office)" },
          { text: "Fully On-Site Office" },
          { text: "Digital Nomad / Flexible Location" }
        ]
      }
    },
    include: { options: true }
  });

  await prisma.vote.create({
    data: { pollId: poll3.id, optionId: poll3.options[0].id, userId: user1.id }
  });
  await prisma.vote.create({
    data: { pollId: poll3.id, optionId: poll3.options[1].id, userId: user2.id }
  });
  await prisma.vote.create({
    data: { pollId: poll3.id, optionId: poll3.options[0].id, userId: user4.id }
  });

  // Create Poll 4: Gaming & Entertainment (Expiring soon)
  const poll4 = await prisma.poll.create({
    data: {
      title: "Game of the Decade: Which world captivated you most?",
      description: "Vote for the most immersive gaming experience.",
      category: "Gaming",
      isPrivate: false,
      isMultiple: false,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // Expiring in 2 hours
      creatorId: user4.id,
      options: {
        create: [
          { text: "Elden Ring" },
          { text: "The Witcher 3: Wild Hunt" },
          { text: "Cyberpunk 2077" },
          { text: "Baldur's Gate 3" }
        ]
      }
    },
    include: { options: true }
  });

  await prisma.vote.create({
    data: { pollId: poll4.id, optionId: poll4.options[3].id, userId: user1.id }
  });
  await prisma.vote.create({
    data: { pollId: poll4.id, optionId: poll4.options[0].id, userId: user2.id }
  });

  console.log("✅ Seeding completed successfully!");
  console.log("Demo Accounts:");
  console.log("👉 Admin: alex@example.com / password123");
  console.log("👉 User:  sophia@example.com / password123");
  console.log("👉 User:  rahul@example.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
