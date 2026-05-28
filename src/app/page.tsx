import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Gauge, Zap, Trophy } from "lucide-react"

function MStripe() {
  return (
    <div className="flex h-1 w-16">
      <div className="flex-1 bg-m-stripe-blue" />
      <div className="flex-1 bg-m-stripe-purple" />
      <div className="flex-1 bg-m-stripe-red" />
    </div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string 
}) {
  return (
    <div className="group relative p-6 bg-card border border-border rounded-sm hover:border-primary/50 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="w-12 h-12 flex items-center justify-center bg-secondary rounded-sm mb-4">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background with carbon fiber effect */}
        <div className="absolute inset-0 carbon-fiber" />
        
        {/* M Stripe accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 m-stripe" />
        
        {/* Radial glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* M Badge */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <MStripe />
            <span className="text-sm font-semibold tracking-[0.3em] text-muted-foreground uppercase">
              M Performance
            </span>
            <MStripe />
          </div>
          
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-balance">
            <span className="text-foreground">THE ULTIMATE</span>
            <br />
            <span className="text-primary">DRIVING MACHINE</span>
          </h1>
          
          {/* Tagline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience precision engineering and uncompromising performance.
            Built for those who demand the extraordinary.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-in">
              <Button size="lg" className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/posts">
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-base font-semibold border-border hover:border-primary/50 hover:bg-secondary"
              >
                Explore Features
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-xl mx-auto">
            {[
              { value: "617", unit: "HP", label: "Max Power" },
              { value: "3.3", unit: "sec", label: "0-100 km/h" },
              { value: "305", unit: "km/h", label: "Top Speed" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl md:text-4xl font-black text-foreground">{stat.value}</span>
                  <span className="text-sm font-medium text-muted-foreground">{stat.unit}</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <MStripe />
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-foreground">
              Engineered for Excellence
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every detail crafted to deliver the ultimate performance experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Gauge}
              title="Precision Control"
              description="Advanced systems that respond to your every command with surgical precision and unwavering accuracy."
            />
            <FeatureCard
              icon={Zap}
              title="Raw Power"
              description="Unleash exhilarating performance with cutting-edge technology that pushes the boundaries of possibility."
            />
            <FeatureCard
              icon={Trophy}
              title="Track Proven"
              description="Born on the track, refined for the road. Technology that has conquered the world's most demanding circuits."
            />
          </div>
        </div>
      </section>
      
      {/* Bottom M Stripe */}
      <div className="h-1 m-stripe" />
    </main>
  )
}
