import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit, Trash2, Plus } from "lucide-react"
import { createSnippet, deleteSnippet } from "@/server/actions/knowledge"

export const dynamic = 'force-dynamic'

interface KnowledgeSnippetData {
  id: string
  category: string
  content: string
}

async function getSnippets() {
  try {
    const snippets = await (prisma as any).knowledgeSnippet.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return snippets as unknown as KnowledgeSnippetData[]
  } catch (e) {
    return []
  }
}

export default async function KnowledgePage() {
  const snippets = await getSnippets()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Knowledge Base</h1>
        <p className="text-gray-500">Teach your chatbot new rules, facts, and answers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Form */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="bg-purple-50 border-b border-purple-100">
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Knowledge
            </CardTitle>
            <CardDescription className="text-purple-700">
              Add a fact for the AI to memorize.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form 
              action={async (formData) => {
                'use server'
                await createSnippet(formData)
              }} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  name="category" 
                  placeholder="e.g. Parking, Pets, Location" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">The Fact / Rule</Label>
                <Textarea 
                  id="content" 
                  name="content" 
                  placeholder="e.g. We strictly have only 1 parking slot available..." 
                  required 
                  className="h-32"
                />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                Save to Brain
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-600" />
              Current Knowledge ({snippets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {snippets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No custom knowledge added yet. The AI is using default fallbacks.
              </div>
            ) : (
              <div className="space-y-4">
                {snippets.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                    <div className="space-y-1">
                      <Badge variant="outline" className="bg-white mb-1">
                        {item.category}
                      </Badge>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                    <form 
                      action={async () => {
                        'use server'
                        await deleteSnippet(item.id)
                      }}
                    >
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}