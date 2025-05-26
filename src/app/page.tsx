import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, Layers } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <MainLayout>
      <section className="py-12 md:py-20 text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary md:text-5xl lg:text-6xl">
          Welcome to React Project Starter
        </h1>
        <p className="mb-8 text-lg text-foreground/80 md:text-xl">
          Your foundation for building amazing Next.js applications with ease and style.
        </p>
        <div className="space-x-4">
          <Button size="lg" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Get In Touch</Link>
          </Button>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-muted/30 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-semibold text-primary">Core Features</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mb-3 flex justify-center">
                  <Zap className="h-12 w-12 text-accent" />
                </div>
                <CardTitle className="text-center">Project Initialization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Quickly start your project with a well-organized structure and essential dependencies.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mb-3 flex justify-center">
                  <Layers className="h-12 w-12 text-accent" />
                </div>
                <CardTitle className="text-center">Routing & Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Pre-configured Next.js routing and a responsive navigation bar for seamless user experience.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mb-3 flex justify-center">
                  <CheckCircle className="h-12 w-12 text-accent" />
                </div>
                <CardTitle className="text-center">Component Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Basic components like Header, Footer, and Layout are ready to use and customize.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-semibold text-primary mb-4">Modern Design</h2>
            <p className="text-foreground/80 mb-6 text-lg">
              Built with a clean, responsive design focusing on readability and user experience. Styled with Tailwind CSS and ShadCN UI components.
            </p>
            <ul className="space-y-2 text-foreground/70">
              <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent" /> Deep Indigo primary for trust.</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent" /> Light Grayish-Blue background for clarity.</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent" /> Amber accents for interactive elements.</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent" /> Professional sans-serif typography.</li>
            </ul>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Modern UI Placeholder" 
              width={600} 
              height={400} 
              className="w-full h-auto"
              data-ai-hint="abstract modern" 
            />
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
