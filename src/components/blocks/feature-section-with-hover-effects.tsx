import { cn } from '@/lib/utils';
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from '@tabler/icons-react';

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: 'Real-time Chat',
      description:
        'Experience instant messaging with sub-50ms latency and end-to-end encryption.',
      icon: <IconTerminal2 />,
    },
    {
      title: 'Smart Matchmaking',
      description:
        'Find your perfect chat partner based on preferences and interests.',
      icon: <IconEaseInOut />,
    },
    {
      title: 'Free to Use',
      description:
        'No hidden fees, no credit card required. Just sign in and start chatting.',
      icon: <IconCurrencyDollar />,
    },
    {
      title: 'High Availability',
      description: '99.99% uptime with multi-region redundancy.',
      icon: <IconCloud />,
    },
    {
      title: 'Scalable Architecture',
      description: 'Built to handle millions of concurrent users seamlessly.',
      icon: <IconRouteAltLeft />,
    },
    {
      title: '24/7 Support',
      description:
        'Our team is always here to help you with any questions or issues.',
      icon: <IconHelp />,
    },
    {
      title: 'Privacy First',
      description:
        'Your conversations are protected with military-grade encryption.',
      icon: <IconAdjustmentsBolt />,
    },
    {
      title: 'Community Driven',
      description: 'Join our growing community of millions of users worldwide.',
      icon: <IconHeart />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        'flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800',
        (index === 0 || index === 4) && 'lg:border-l dark:border-neutral-800',
        index < 4 && 'lg:border-b dark:border-neutral-800'
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
