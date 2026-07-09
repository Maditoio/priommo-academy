import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice, localizedField } from "@/lib/utils";
import { levelName } from "@/lib/levels";
import { MaterialIcon } from "@/components/ui/material-icon";
import Image from "next/image";

interface CourseCardProps {
  course: {
    slug: string;
    titleFr: string;
    titleEn: string;
    descriptionFr: string;
    descriptionEn: string;
    level: { nameFr: string; nameEn: string };
    price: { toString(): string } | number;
    currency: string;
    imageUrl?: string | null;
    _count?: { modules: number };
  };
  locale: string;
  enrollLabel: string;
  levelLabel: string;
  freeLabel: string;
  courseBasePath?: string;
}

export function CourseCard({
  course,
  locale,
  enrollLabel,
  freeLabel,
  courseBasePath = "/courses",
}: CourseCardProps) {
  const title = localizedField(course, "title", locale);
  const description = localizedField(course, "description", locale);
  const price = parseFloat(course.price.toString());
  const isFree = price === 0;

  return (
    <Card className="card-surface flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9] bg-surface-hover">
        {course.imageUrl ? (
          <Image src={course.imageUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MaterialIcon name="menu_book" className="text-ink-muted/30" size={48} />
          </div>
        )}
        <Badge variant="level" className="absolute left-3 top-3">
          {levelName(course.level, locale)}
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-ink-muted">{description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-lg font-semibold text-ink">
          {isFree ? freeLabel : formatPrice(price, course.currency, locale)}
        </span>
        <Button asChild size="sm" variant="secondary">
          <Link href={`${courseBasePath}/${course.slug}`}>{enrollLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
