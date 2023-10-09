import { CreateCountryDto } from './create-country.dto';

export const CountryDTOStub = (): CreateCountryDto => {
  return {
    name: 'Pakistan',
    iso: 'PK',
    code: '+92',
    numberLength: 10,
    timeZone: 'UTC+5',
    currency: 'PKR',
    flag: 'https://flagcdn.com/w320/pk.png',
    isActive: true,
  };
};
