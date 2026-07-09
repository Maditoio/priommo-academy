import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice, localizedField } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import Image from "next/image";

interface CourseCardProps {
  course: {
    slug: string;
    titleFr: string;
    titleEn: string;
    descriptionFr: string;
    descriptionEn: string;
    level: string;
    price: { toString(): string } | number;
    currency: string;
    imageUrl?: string | null;
    _count?: { modules: number };
  };
  locale: string;
  enrollLabel: string;
  levelLabel: string;
  freeLabel: string;
}

export function CourseCard({ course, locale, enrollLabel, levelLabel, freeLabel }: CourseCardProps) {
  const title = localizedField(course, "title", locale);
  const description = localizedField(course, "description", locale);
  const price = parseFloat(course.price.toString());
  const isFree = price === 0;

  return (
    <Card className="flex flex-col overflow-hidden transition-colors hover:border-navy/25">
      <div className="relative aspect-[16/9] bg-navy/5">
        {course.imageUrl ? (
          <Image src={course.imageUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-navy/20" />
          </div>
        )}
        <Badge variant="level" className="absolute left-3 top-3">
          {course.level}
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-ink-muted">{description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-navy/10 pt-4">
        <span className="font-display text-lg font-semibold text-navy">
          {isFree ? freeLabel : formatPrice(price, course.currency, locale)}
        </span>
        <Button asChild size="sm" variant="outline">
          <Link href={`/courses/${course.slug}`}>{enrollLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
