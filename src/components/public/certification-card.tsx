import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { localizedField } from "@/lib/utils";
import { VerificationSeal } from "@/components/public/verification-seal";

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
}: CertificationCardProps) {
  const title = localizedField(certification, "title", locale);
  const description = localizedField(certification, "description", locale);

  return (
    <Card className="flex flex-col transition-colors hover:border-navy/25">
      <CardHeader className="items-center pb-2 text-center">
        <VerificationSeal
          status="valid"
          code={certification.slug.slice(0, 10).toUpperCase()}
          level={certification.level}
          size="sm"
        />
        <Badge variant="level" className="mt-2">
          {certification.level}
        </Badge>
        <CardTitle className="mt-3 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 text-center">
        <p className="line-clamp-3 text-sm text-ink-muted">{description}</p>
      </CardContent>
      <CardFooter className="justify-center pb-6">
        <Button asChild variant="outline" className="w-full max-w-xs">
          <Link href={`/certifications/${certification.slug}`}>{viewLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
