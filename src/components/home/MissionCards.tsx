import {
  Users,
  HandHeart,
  BookOpen,
  Globe,
} from "lucide-react";

const cards = [
  {
    icon: Users,
    title: "Youth Development",
    description: "Empowering students through community service",
  },
  {
    icon: HandHeart,
    title: "Community Service",
    description: "Working for the well-being of society",
  },
  {
    icon: BookOpen,
    title: "Character Building",
    description: "Building discipline, leadership and integrity",
  },
  {
    icon: Globe,
    title: "Nation Building",
    description: "Contributing to a strong and united India",
  },
];

export default function MissionCards() {
  return (
    <section className="bg-[#0F2B7B] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="flex items-center gap-4 border-r border-white/20 p-8 last:border-r-0"
            >
              <Icon size={46} />

              <div>
                <h3 className="text-lg font-bold">
                  {card.title}
                </h3>

                <p className="mt-2 text-sm text-blue-100">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
}