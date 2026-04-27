export const DEPARTMENTS = ["GI", "MIP", "SMA", "BCG", "PC", "SVI"];

function parseTimeToMinutes(value) {
  if (!/^\d{2}:\d{2}$/.test(value || "")) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}

export function validateStudentOrder({ studentName, department, pickupTime, quantity }) {
  const errors = {};
  const name = studentName.trim();
  const quantityNumber = Number(quantity);
  const pickupMinutes = parseTimeToMinutes(pickupTime);

  if (!name) {
    errors.studentName = "Entrez votre nom pour identifier la commande.";
  } else if (name.length < 2) {
    errors.studentName = "Le nom doit contenir au moins 2 caractères.";
  } else if (name.length > 80) {
    errors.studentName = "Le nom doit rester sous 80 caractères.";
  } else if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(name)) {
    errors.studentName = "Le nom doit contenir des lettres.";
  }

  if (!DEPARTMENTS.includes(department)) {
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

export function normalizeOrderPayload({ studentName, department, mealId, quantity, pickupTime }) {
  return {
    student_name: studentName.trim(),
    student_department: department,
    meal_id: mealId,
    quantity: Number(quantity),
    pickup_time: pickupTime,
  };
}

export function validateMealForm(form, categoryValues) {
  const errors = {};
  const name = form.name.trim();
  const description = form.description.trim();
  const imageUrl = form.image_url.trim();
  const price = Number(form.price);
  const preparationTime = Number(form.preparation_time);
  const popularityScore = Number(form.popularity_score);

  if (!name) {
    errors.name = "Ajoutez le nom du plat.";
  } else if (name.length < 2) {
    errors.name = "Le nom doit contenir au moins 2 caractères.";
  } else if (name.length > 80) {
    errors.name = "Le nom doit rester sous 80 caractères.";
  }

  if (!categoryValues.includes(form.category)) {
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
    ...form,
    name: form.name.trim(),
    description: form.description.trim(),
    image_url: form.image_url.trim(),
    price: Number(form.price),
    preparation_time: Number(form.preparation_time),
    popularity_score: Number(form.popularity_score),
  };
}
