import { ServiceType } from '../types';

export type Language = 'en' | 'es';

export type IntakeState = {
  business_name: string;
  address_line: string;
  city: string;
  state: string;
  zip: string;
  system_type: string;
  gallons: string;
  parking_distance: string;
  last_service_months: string;
  additional_services: string;
  last_cleaned_at: string;
  needs_uco: string;
  wants_to_move_forward: boolean | 'UNSURE';
};

export type ContactState = {
  contact_name: string;
  contact_phone: string;
  contact_email: string;
};

export type IntakeField = keyof IntakeState;
export type ContactField = keyof ContactState;

export const defaultIntakeState: IntakeState = {
  business_name: '',
  address_line: '',
  city: '',
  state: '',
  zip: '',
  system_type: '',
  gallons: '',
  parking_distance: '',
  last_service_months: '',
  additional_services: '',
  last_cleaned_at: '',
  needs_uco: '',
  wants_to_move_forward: 'UNSURE',
};

export const defaultContactState: ContactState = {
  contact_name: '',
  contact_phone: '',
  contact_email: '',
};

export const getFirstMissingField = (obj: IntakeState): IntakeField | null => {
  if (!obj.business_name.trim()) return 'business_name';
  if (!obj.address_line.trim()) return 'address_line';
  if (!obj.city.trim()) return 'city';
  if (!obj.state.trim()) return 'state';
  if (!obj.zip.trim()) return 'zip';
  if (!obj.system_type.trim()) return 'system_type';
  const isGreaseTrap = obj.system_type === ServiceType.GREASE_TRAP;
  if (!isGreaseTrap && !obj.gallons.trim()) return 'gallons';
  if (!obj.parking_distance.trim()) return 'parking_distance';
  if (!obj.last_service_months.trim()) return 'last_service_months';
  if (!obj.additional_services.trim()) return 'additional_services';
  if (!obj.last_cleaned_at.trim()) return 'last_cleaned_at';
  if (!obj.needs_uco.trim()) return 'needs_uco';
  return null;
};

export const getFirstMissingContactField = (obj: ContactState): ContactField | null => {
  if (!obj.contact_name.trim()) return 'contact_name';
  if (!obj.contact_phone.trim()) return 'contact_phone';
  if (!obj.contact_email.trim()) return 'contact_email';
  return null;
};

export const getQuestionForField = (field: IntakeField, language: Language | null = 'en') => {
  const es = language === 'es';
  switch (field) {
    case 'business_name':
      return es ? '¿Cuál es el nombre de su negocio?' : 'What is your business name?';
    case 'address_line':
      return es ? '¿Cuál es la dirección?' : 'What is the street address?';
    case 'city':
      return es ? '¿En qué ciudad está?' : 'What city is this in?';
    case 'state':
      return es ? '¿En qué estado está?' : 'What state is this in?';
    case 'zip':
      return es ? '¿Cuál es el código postal?' : 'What is the ZIP code?';
    case 'system_type':
      return es ? '¿Qué tipo de sistema tiene?' : 'What system do you have?';
    case 'gallons':
      return es ? '¿Cuántos galones tiene el sistema?' : 'How many gallons does the system hold?';
    case 'parking_distance':
      return es ? '¿Cuál es la distancia de estacionamiento (en pies)?' : 'What is the parking distance (in feet)?';
    case 'last_service_months':
      return es ? '¿Cuántos meses desde su último servicio?' : 'How many months since your last service?';
    case 'additional_services':
      return es ? '¿Algún servicio adicional?' : 'Any additional services?';
    case 'last_cleaned_at':
      return es ? '¿Cuándo fue la última limpieza?' : 'When was the system last cleaned?';
    case 'needs_uco':
      return es ? '¿Necesita reciclaje de aceite usado (UCO)?' : 'Do you need used cooking oil (UCO) recycling?';
    default:
      return '';
  }
};

export const getQuestionForContactField = (field: ContactField, language: Language | null = 'en') => {
  const es = language === 'es';
  switch (field) {
    case 'contact_name':
      return es ? '¿Cuál es el mejor nombre de contacto?' : 'What is the best contact name?';
    case 'contact_phone':
      return es ? '¿Cuál es el mejor número de teléfono?' : 'What is the best phone number?';
    case 'contact_email':
      return es ? '¿Cuál es la mejor dirección de correo electrónico?' : 'What is the best email address?';
    default:
      return '';
  }
};
