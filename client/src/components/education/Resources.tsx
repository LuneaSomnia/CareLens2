import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, BookOpen, Video, FileText } from "lucide-react";

type Resource = {
  id: string;
  type: "article" | "video" | "infographic";
  title: string;
  description: string;
  url: string;
  tags: string[];
};

const SAMPLE_RESOURCES: Resource[] = [
  {
    id: "1",
    type: "article",
    title: "Understanding Preventive Healthcare",
    description: "A comprehensive guide to preventive healthcare measures.",
    url: "https://example.com/article1",
    tags: ["preventive care", "wellness"]
  },
  {
    id: "2",
    type: "video",
    title: "Heart Health Basics",
    description: "Expert discussion on maintaining heart health.",
    url: "https://youtube.com/watch?v=example",
    tags: ["heart health", "cardiovascular"]
  }
  // Add more sample resources
];

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = Array.from(
    new Set(SAMPLE_RESOURCES.flatMap(r => r.tags))
  );

  const filteredResources = SAMPLE_RESOURCES.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => resource.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Educational Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {filteredResources.map(resource => (
                  <Card key={resource.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {resource.type === "article" && <FileText className="h-6 w-6" />}
                        {resource.type === "video" && <Video className="h-6 w-6" />}
                        {resource.type === "infographic" && <BookOpen className="h-6 w-6" />}
                        
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{resource.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {resource.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {resource.tags.map(tag => (
                              <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            View Resource
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
