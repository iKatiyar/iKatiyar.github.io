import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home/home.component';
import { SearchComponent } from './search/search/search.component';
import { PortfolioComponent } from './portfolio/portfolio/portfolio.component';
import { WatchlistComponent } from './watchlist/watchlist/watchlist.component';

const routes: Routes = [{
  path: '', redirectTo: '/search/home', pathMatch: 'full'
}, {
  path: 'search/home', component: HomeComponent
},
{ path: 'search/:ticker', component: SearchComponent },
{ path: 'portfolio', component: PortfolioComponent },
{ path: 'watchlist', component: WatchlistComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
