import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            AI Character Pack Generator
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Create stunning character artwork using advanced AI. Generate high-quality images 
            with enhanced prompts, personalized titles, and detailed descriptions.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/80 text-white px-8 py-4 text-lg"
          >
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-robot text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Enhancement</h3>
              <p className="text-slate-400">
                Google Gemini AI enhances your prompts for stunning, detailed character artwork
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-images text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">High-Quality Images</h3>
              <p className="text-slate-400">
                Generate professional-grade character images with advanced AI models
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-tags text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Metadata</h3>
              <p className="text-slate-400">
                Each image comes with AI-generated titles, descriptions, and tags
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Popular Characters</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {['Naruto', 'Goku', 'Batman', 'Link', 'Mario'].map((character) => (
              <Card key={character} className="bg-slate-800 border-slate-700 hover:border-primary transition-colors">
                <CardContent className="p-4 text-center">
                  <p className="text-white font-medium">{character}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}