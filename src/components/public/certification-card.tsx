import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { localizedField } from "@/lib/utils";
import { Award } from "lucide-react";

interface CertificationCardProps {
  certification: {
    slug: string;
    titleFr: string;
    titleEn: string;
    descriptionFr: string;
    descriptionEn: string;
    level: string;
    course?: { slug: string; titleFr: string; titleEn: string } | null;
  };
  locale: string;
  viewLabel: string;
  levelLabel: string;
}

export function CertificationCard({
  certification,
  locale,
  viewLabel,
  levelLabel,
}: CertificationCardProps) {
  const title = localizedField(certification, "title", locale);
  const description = localizedField(certification, "description", locale);

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
          <Award className="h-6 w-6 text-primary" />
        </div>
        <Badge variant="secondary" className="mb-2 w-fit">
          {levelLabel}: {certification.level}
        </Badge>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/certifications/${certification.slug}`}>{viewLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
