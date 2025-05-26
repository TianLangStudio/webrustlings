import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Code, Users, Settings, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const services = [
  {
    icon: Code,
    title: "Rapid Prototyping",
    description: "Quickly build and iterate on your ideas with our pre-configured setup.",
    features: ["Next.js 14 with App Router", "Tailwind CSS", "ShadCN UI Components"]
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "A consistent structure that helps teams work together efficiently.",
    features: ["Clear File Organization", "TypeScript Support", "ESLint & Prettier Configured"]
  },
  {
    icon: Settings,
    title: "Customizable Foundation",
    description: "Easily extend and adapt the starter to fit your project's unique requirements.",
    features: ["Modular Components", "Themeable UI", "Easy Dependency Management"]
  }
];

export default function ServicesPage() {
  return (
    <MainLayout>
      <div className="py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">Our Services</h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            React Project Starter offers a suite of features designed to streamline your development process from day one.
          </p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service) => (
            <Card key={service.title} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <service.icon className="h-12 w-12 text-accent" />
                </div>
                <CardTitle className="text-2xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="mb-4 text-center">{service.description}</CardDescription>
                <ul className="space-y-2 text-sm text-foreground/70">
                  {service.features.map(feature => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="bg-muted/30 p-8 md:p-12 rounded-lg mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Image 
                src="https://placehold.co/600x450.png" 
                alt="Service benefits placeholder" 
                width={600} 
                height={450} 
                className="rounded-lg shadow-md w-full"
                data-ai-hint="technology abstract"
              />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-primary mb-6">Why Choose React Project Starter?</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="h-8 w-8 text-accent shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-medium text-foreground">Reliability & Best Practices</h3>
                    <p className="text-foreground/70">Built on modern standards with a focus on performance, accessibility, and maintainability.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Zap className="h-8 w-8 text-accent shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-medium text-foreground">Time-Saving</h3>
                    <p className="text-foreground/70">Skip the tedious setup and dive straight into building your application's core functionality.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Layers className="h-8 w-8 text-accent shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-medium text-foreground">Scalable Architecture</h3>
                    <p className="text-foreground/70">Designed to grow with your project, accommodating increasing complexity and features.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold text-primary mb-4">Ready to get started?</h2>
          <p className="text-lg text-foreground/80 mb-8 max-w-xl mx-auto">
            Explore our documentation or contact us for more information on how React Project Starter can benefit your next project.
          </p>
          <Button size="lg" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </section>
      </div>
    </MainLayout>
  );
}
