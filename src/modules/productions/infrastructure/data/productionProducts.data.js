import { normalizeProductOptions } from "../../domain/entities/productionProduct.entity";

export const PRODUCTION_PRODUCTS_DATA = normalizeProductOptions([
  {
    label: "Kavrulmuş İç Fındık",
    value: "Kavrulmuş İç Fındık",
    group: "İç Fındık",
    keywords: ["kavrulmuş", "ic findik", "iç fındık", "hazelnut"],
  },
  {
    label: "Natürel İç Fındık",
    value: "Natürel İç Fındık",
    group: "İç Fındık",
    keywords: ["naturel", "natürel", "ic findik", "çiğ"],
  },
  {
    label: "Blanched İç Fındık",
    value: "Blanched İç Fındık",
    group: "İç Fındık",
    keywords: ["blanched", "beyazlatılmış", "soyulmuş"],
  },
  {
    label: "Kıyılmış Fındık",
    value: "Kıyılmış Fındık",
    group: "Parçalı Ürün",
    keywords: ["kıyılmış", "granül", "chopped", "parça"],
  },
  {
    label: "Fındık Unu",
    value: "Fındık Unu",
    group: "Parçalı Ürün",
    keywords: ["un", "flour", "powder"],
  },
  {
    label: "Fındık Ezmesi",
    value: "Fındık Ezmesi",
    group: "İleri İşlenmiş",
    keywords: ["ezme", "paste", "püre"],
  },
  {
    label: "Fındık Püresi",
    value: "Fındık Püresi",
    group: "İleri İşlenmiş",
    keywords: ["pure", "püre", "hazelnut puree"],
  },
  {
    label: "Fındık Kreması",
    value: "Fındık Kreması",
    group: "İleri İşlenmiş",
    keywords: ["krema", "cream", "spread"],
  },
  {
    label: "Kabuklu Fındık",
    value: "Kabuklu Fındık",
    group: "Ham Ürün",
    keywords: ["kabuklu", "shell", "ham"],
  },
  {
    label: "Seçilmiş Fındık",
    value: "Seçilmiş Fındık",
    group: "Ham Ürün",
    keywords: ["selected", "kalibre", "elek"],
  },
]);