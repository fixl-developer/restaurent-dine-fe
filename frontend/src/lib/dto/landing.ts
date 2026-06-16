/** Landing-page CMS DTOs — admin-editable hero / gallery / how-it-works copy. */

export interface LandingStepDto {
  num: string;
  name: string;
  body: string;
}

export interface LandingGalleryItemDto {
  id: string;
  imageUrl: string;
  caption?: string;
}

export interface LandingContentDto {
  hero?: {
    eyebrow?: string;
    headline?: string;
    body?: string;
  };
  howItWorks: LandingStepDto[];
  gallery: LandingGalleryItemDto[];
  galleryHashtag?: string;
}

export type LandingContentPatch = Partial<LandingContentDto>;
