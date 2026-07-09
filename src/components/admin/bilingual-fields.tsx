import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BilingualFieldProps {
  labels: {
    titleFr: string;
    titleEn: string;
    descriptionFr: string;
    descriptionEn: string;
  };
  defaultValues?: {
    titleFr?: string;
    titleEn?: string;
    descriptionFr?: string;
    descriptionEn?: string;
  };
}

export function BilingualFields({ labels, defaultValues }: BilingualFieldProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="titleFr">{labels.titleFr}</Label>
          <Input id="titleFr" name="titleFr" defaultValue={defaultValues?.titleFr} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descriptionFr">{labels.descriptionFr}</Label>
          <Textarea
            id="descriptionFr"
            name="descriptionFr"
            rows={4}
            defaultValue={defaultValues?.descriptionFr}
            required
          />
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="titleEn">{labels.titleEn}</Label>
          <Input id="titleEn" name="titleEn" defaultValue={defaultValues?.titleEn} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descriptionEn">{labels.descriptionEn}</Label>
          <Textarea
            id="descriptionEn"
            name="descriptionEn"
            rows={4}
            defaultValue={defaultValues?.descriptionEn}
            required
          />
        </div>
      </div>
    </div>
  );
}
