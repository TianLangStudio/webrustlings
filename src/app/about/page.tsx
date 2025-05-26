import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Target, Eye } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">About React Project Starter</h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            We provide a solid foundation for developers to kickstart their Next.js projects, focusing on best practices, clean design, and essential features out-of-the-box.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center shadow-lg">
            <CardHeader>
              <div className="flex justify-center mb-3">
                <Target className="h-12 w-12 text-accent" />
              </div>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">
                To accelerate development by providing a reliable and feature-rich starter kit, allowing developers to focus on building unique application logic.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg">
            <CardHeader>
              <div className="flex justify-center mb-3">
                <Eye className="h-12 w-12 text-accent" />
              </div>
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">
                To be the go-to starter for Next.js projects, known for its quality, ease of use, and comprehensive feature set that adapts to various project needs.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg">
            <CardHeader>
              <div className="flex justify-center mb-3">
                <Users className="h-12 w-12 text-accent" />
              </div>
              <CardTitle className="text-2xl">The Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">
                A passionate group of developers dedicated to improving the React ecosystem and simplifying the initial stages of web development.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-muted/30 p-8 rounded-lg">
            <div className="md:w-1/2">
              <Image 
                src="https://placehold.co/500x350.png" 
                alt="Team working placeholder" 
                width={500} 
                height={350} 
                className="rounded-lg shadow-md w-full"
                data-ai-hint="team collaboration" 
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-semibold text-primary mb-4">Behind the Code</h2>
              <p className="text-foreground/80 mb-4">
                React Project Starter began as an internal tool to streamline our own development workflow. Recognizing its potential to help others, we decided to open-source it and build a community around it.
              </p>
              <p className="text-foreground/80">
                Our commitment is to continuous improvement, incorporating feedback, and staying up-to-date with the latest web technologies.
              </p>
            </div>
          </div>
        </section>
        
        <section className="text-center">
          <h2 className="text-3xl font-semibold text-primary mb-8">Meet Our Core Contributors</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-2 border-2 border-accent">
                  <AvatarImage src={`https://placehold.co/100x100.png?text=Dev${index+1}`} alt={`Developer ${index + 1}`} data-ai-hint="professional portrait" />
                  <AvatarFallback>D{index+1}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-foreground">Developer {index + 1}</p>
                <p className="text-sm text-muted-foreground">Lead Engineer</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
