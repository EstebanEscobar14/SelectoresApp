import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { switchMap, filter, tap } from 'rxjs/operators';
import { SmallCountry, Region } from '../../interfaces/country.interface';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  public myForm = this.formBuilder.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private countriesService: CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChange();
    this.onCountryChange();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChange(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap(() => {
          this.myForm.get('country')!.setValue('');
        }),
        tap(() => {
          this.borders = [];
        }),
        filter(region => region !== '' && region !== null),
        switchMap((region) => this.countriesService.getCountryByRegion(region as Region))
      )
      .subscribe((countries) => {
        this.countriesByRegion = countries;
      });
  }

  onCountryChange(): void {
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap(() => {
          this.myForm.get('border')!.setValue('');
        }),
        filter(country => country !== '' && country !== null),
        switchMap((country) => this.countriesService.getBorderByCountryCode(country as string)),
        switchMap((country) => this.countriesService.getCountryBordersByCodes(country.borders))
      )
      .subscribe((borders) => {
        this.borders = borders;
      });
  }
}
