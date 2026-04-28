export const DEPARTMENTS = ["GI", "MIP", "SMA", "BCG", "PC", "SVI"];

export function sanitizeText(value, { maxLength = 240 } = {}) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function parseTimeToMinutes(value) {
  const timeValue = sanitizeText(value, { maxLength: 20 });
  if (!/^\d{2}:\d{2}$/.test(timeValue)) return null;
  const [hours, minutes] = timeValue.split(":").map(Number);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function isValidUrl(value) {
  try {
    const url = new URL(sanitizeText(value, { maxLength: 500 }));
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}

export function validateStudentOrder(input = {}) {
  const { studentName, department, pickupTime, quantity } = input || {};
  const errors = {};
  const name = sanitizeText(studentName, { maxLength: 80 });
  const departmentValue = sanitizeText(department, { maxLength: 20 });
  const pickupValue = sanitizeText(pickupTime, { maxLength: 20 });
  const quantityNumber = Number(quantity);
  const pickupMinutes = parseTimeToMinutes(pickupValue);

  if (!name) {
    errors.studentName = "Entrez votre nom pour identifier la commande.";
  } else if (name.length < 2) {
    errors.studentName = "Le nom doit contenir au moins 2 caractères.";
  } else if (name.length > 80) {
    errors.studentName = "Le nom doit rester sous 80 caractères.";
  } else if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(name)) {
    errors.studentName = "Le nom doit contenir des lettres.";
  }

  if (!DEPARTMENTS.includes(departmentValue)) {
    errors.department = "Choisissez un département valide.";
  }

  if (pickupMinutes === null) {
    errors.pickupTime = "Choisissez une heure de pickup valide.";
  } else {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isNextDayEarlyPickup = currentMinutes >= 22 * 60 && pickupMinutes <= 2 * 60;
    if (pickupMinutes < currentMinutes + 5 && !isNextDayEarlyPickup) {
      errors.pickupTime = "Choisissez un créneau au moins 5 minutes plus tard.";
    }
  }

  if (!Number.isInteger(quantityNumber) || quantityNumber < 1 || quantityNumber > 10) {
    errors.quantity = "La quantité doit être entre 1 et 10.";
  }

  return errors;
}

export function normalizeOrderPayload(input = {}) {
  const { studentName, department, mealId, quantity, pickupTime } = input || {};
  return {
    student_name: sanitizeText(studentName, { maxLength: 80 }),
    student_department: sanitizeText(department, { maxLength: 20 }),
    meal_id: Number(mealId),
    quantity: Number(quantity),
    pickup_time: sanitizeText(pickupTime, { maxLength: 20 }),
  };
}

export function validateMealForm(form = {}, categoryValues = []) {
  const errors = {};
  const name = sanitizeText(form?.name, { maxLength: 80 });
  const category = sanitizeText(form?.category, { maxLength: 60 });
  const description = sanitizeText(form?.description, { maxLength: 240 });
  const imageUrl = sanitizeText(form?.image_url, { maxLength: 500 });
  const price = Number(form?.price);
  const preparationTime = Number(form?.preparation_time);
  const popularityScore = Number(form?.popularity_score);

  if (!name) {
    errors.name = "Ajoutez le nom du plat.";
  } else if (name.length < 2) {
    errors.name = "Le nom doit contenir au moins 2 caractères.";
  } else if (name.length > 80) {
    errors.name = "Le nom doit rester sous 80 caractères.";
  }

  if (!categoryValues.includes(category)) {
    errors.category = "Choisissez une catégorie valide.";
  }

  if (!Number.isFinite(price) || price < 5 || price > 35) {
    errors.price = "Le prix doit être entre 5 et 35 MAD.";
  }

  if (!description) {
    errors.description = "Ajoutez une courte description.";
  } else if (description.length < 10) {
    errors.description = "La description doit contenir au moins 10 caractères.";
  } else if (description.length > 240) {
    errors.description = "La description doit rester sous 240 caractères.";
  }

  if (!imageUrl) {
    errors.image_url = "Ajoutez une URL d'image.";
  } else if (!isValidUrl(imageUrl)) {
    errors.image_url = "Utilisez une URL d'image valide en http ou https.";
  }

  if (!Number.isInteger(preparationTime) || preparationTime < 1 || preparationTime > 30) {
    errors.preparation_time = "Le temps de préparation doit être entre 1 et 30 minutes.";
  }

  if (!Number.isInteger(popularityScore) || popularityScore < 0 || popularityScore > 100) {
    errors.popularity_score = "La popularité doit être entre 0 et 100.";
  }

  return errors;
}

export function normalizeMealPayload(form) {
  return {
    name: sanitizeText(form?.name, { maxLength: 80 }),
    category: sanitizeText(form?.category, { maxLength: 60 }),
    price: Number(form?.price),
    description: sanitizeText(form?.description, { maxLength: 240 }),
    image_url: sanitizeText(form?.image_url, { maxLength: 500 }),
    preparation_time: Number(form?.preparation_time),
    is_available: Boolean(form?.is_available),
    popularity_score: Number(form?.popularity_score),
  };
}
