import { TranslateService } from '@ngx-translate/core';

const typeAliases: Record<string, string> = {
  apartment: 'APARTMENT',
  'شقة': 'APARTMENT',
  villa: 'VILLA',
  'فيلا': 'VILLA',
  duplex: 'DUPLEX',
  'دوبلكس': 'DUPLEX',
  townhouse: 'TOWNHOUSE',
  'تاون هاوس': 'TOWNHOUSE',
  studio: 'STUDIO',
  'ستوديو': 'STUDIO',
  chalet: 'CHALET',
  'شاليه': 'CHALET',
  penthouse: 'PENTHOUSE',
  'بنتهاوس': 'PENTHOUSE',
  house: 'HOUSE',
  'منزل': 'HOUSE',
  office: 'OFFICE',
  'مكتب': 'OFFICE',
  land: 'LAND',
  'أرض': 'LAND',
};

const statusAliases: Record<string, string> = {
  available: 'AVAILABLE',
  'متاح': 'AVAILABLE',
  sold: 'SOLD',
  'مباع': 'SOLD',
  rented: 'RENTED',
  'مؤجر': 'RENTED',
  pending: 'PENDING',
  'قيد الانتظار': 'PENDING',
};

const finishingAliases: Record<string, string> = {
  finished: 'FINISHED',
  'تشطيب': 'FINISHED',
  'without-finishing': 'WITHOUT_FINISHING',
  'without finishing': 'WITHOUT_FINISHING',
  unfinished: 'WITHOUT_FINISHING',
  'بدون تشطيب': 'WITHOUT_FINISHING',
  'semi-finished': 'SEMI_FINISHED',
  'semi finished': 'SEMI_FINISHED',
  'نصف تشطيب': 'SEMI_FINISHED',
  'fully-finished': 'FULLY_FINISHED',
  'fully finished': 'FULLY_FINISHED',
  'تشطيب كامل': 'FULLY_FINISHED',
  'super-lux': 'SUPER_LUX',
  'super lux': 'SUPER_LUX',
  'سوبر لوكس': 'SUPER_LUX',
};

const locationAliases: Record<string, string> = {
  egypt: 'EGYPT',
  'مصر': 'EGYPT',
  cairo: 'CAIRO',
  'القاهرة': 'CAIRO',
  giza: 'GIZA',
  'الجيزة': 'GIZA',
  'new zayed': 'NEW_ZAYED',
  'نيو زايد': 'NEW_ZAYED',
  jirian: 'JIRIAN',
  'جريان': 'JIRIAN',
  'sheikh zayed': 'SHEIKH_ZAYED',
  'الشيخ زايد': 'SHEIKH_ZAYED',
  'el shorouk': 'EL_SHOROUK',
  'مدينة الشروق': 'EL_SHOROUK',
  shorouk: 'EL_SHOROUK',
  october: 'OCTOBER',
  '6th of october': 'OCTOBER',
  '6 october': 'OCTOBER',
  'أكتوبر': 'OCTOBER',
  'new administrative capital': 'ADMINISTRATIVE_CAPITAL',
  'administrative capital': 'ADMINISTRATIVE_CAPITAL',
  'العاصمة الإدارية': 'ADMINISTRATIVE_CAPITAL',
  'el zeitoun': 'EL_ZEITOUN',
  'حي الزيتون': 'EL_ZEITOUN',
  'el maadi': 'EL_MAADI',
  maadi: 'EL_MAADI',
  'المعادي': 'EL_MAADI',
};

export function displayTranslatedPropertyType(
  translate: TranslateService,
  propertyType: string,
): string {
  return translatedPropertyLabel(
    translate,
    'PROPERTY_LABELS.TYPES',
    propertyType,
    'Property',
    typeAliases,
  );
}

export function displayTranslatedPropertyStatus(translate: TranslateService, status: string): string {
  return translatedPropertyLabel(
    translate,
    'PROPERTY_LABELS.STATUS',
    status,
    status || 'Status',
    statusAliases,
  );
}

export function displayTranslatedFinishingType(
  translate: TranslateService,
  finishingType: string,
): string {
  return translatedPropertyLabel(
    translate,
    'PROPERTY_LABELS.FINISHING',
    finishingType,
    'Finishing',
    finishingAliases,
  );
}

export function displayTranslatedPropertyLocation(
  translate: TranslateService,
  location: string,
): string {
  return translatedPropertyLabel(
    translate,
    'PROPERTY_LABELS.LOCATIONS',
    location,
    'Location',
    locationAliases,
  );
}

export function propertyStatusKey(status: string): string {
  return normalizedLabelKey(status, statusAliases);
}

function translatedPropertyLabel(
  translate: TranslateService,
  baseKey: string,
  value: string,
  emptyFallback: string,
  aliases: Record<string, string>,
): string {
  const fallback = value ? formatPropertyLabel(value) : emptyFallback;
  const key = `${baseKey}.${normalizedLabelKey(value, aliases)}`;
  const translated = translate.instant(key);
  return translated === key ? fallback : translated;
}

function normalizedLabelKey(value: string, aliases: Record<string, string>): string {
  const lookupValue = normalizeLookupValue(value);
  return aliases[lookupValue] ?? value.trim().replace(/[\s-]+/g, '_').toUpperCase();
}

function normalizeLookupValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function formatPropertyLabel(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
