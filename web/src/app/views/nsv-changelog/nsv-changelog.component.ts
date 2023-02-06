import { Component, HostBinding, OnInit } from '@angular/core';
import * as moment from 'moment';
import { PersistenceService } from '@app/services/util-services/persistence.service';
import { PKEY } from '@app/common/constants';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { map } from 'rxjs/operators';

type CommitType = 'fixed' | 'enhanced' | 'updated' | 'new' | 'refactor';

interface ChangelogCommit {
  type: CommitType;
  description: string;
  author?: string;
  commitHash?: string;
  date?: number;
  project?: string;
}

interface Changelog {
  version: string;
  date: number;
  changes: ChangelogCommit[];
}

@Component({
  selector: 'nsv-changelog',
  templateUrl: './nsv-changelog.component.html',
  styles: [
    ` :host { overflow-x: hidden; } `,
    `.anchorjs-link {
      padding-left: .5rem;
      font-size: 90%;
      color: rgba(55,125,255, .5) !important;
      transition: color .16s linear;
      opacity: 0;
    }`,
    `
    [data-anchorjs-icon]::after {
      content: attr(data-anchorjs-icon);
    }
    `,
    `
    h2:hover .anchorjs-link, h3:hover .anchorjs-link, h4:hover .anchorjs-link {
      opacity: 1;
    }
    `
  ]
})
export class ChangelogComponent implements OnInit {
  @HostBinding('class.content-wrapper') get _classContentWrapper() {
    return !0;
  }
  public changelog$
  changelog: Changelog[] = [];

  constructor(persistence: PersistenceService, private http: AppHttpClientService) {
    const lang = persistence.get(PKEY.LANGUAGE);
    moment.locale(lang);
  }

  ngOnInit() {
    this.changelog$ = this.http.get('/changelog').pipe(
      map((data: Changelog[]) => {
        return data.map(change => {
          const replaceVersion = this.changelog.find(e => e.version === change.version);
          change.changes = (change?.changes ?? []).map(c => {
            const desc = String(c.description).toLowerCase();
            if (
              String(c.type).toLowerCase() === 'fix' ||
              desc.startsWith('fix') ||
              desc.indexOf('corregido') !== -1) {
              c.type = 'fixed';
            }

            if (desc.startsWith('mejora') || desc.startsWith('agregando')) {
              c.type = 'enhanced';
            }

            if (desc.startsWith('nuev') || desc.startsWith('añadi')) {
              c.type = 'new';
            }

            if (
              // renonbrando
              desc.startsWith('renombrando') ||
              desc.startsWith('cambiando') ||
              desc.startsWith('modificando') ||
              desc.startsWith('eliminando') ||
              desc.startsWith('removiendo') ||
              desc.startsWith('mostrando') ||
              desc.indexOf('refactor ') !== -1
            ) {
              c.type = 'refactor';
            }

            return c;
          });

          if (replaceVersion && replaceVersion.changes?.length) {
            change.changes = change.changes.map(c => {
              const ch = replaceVersion.changes.find(it => it.commitHash === c.commitHash);
              if (undefined !== ch) {
                c.description = ch.description;
                c.type = ch.type;
              }
              return c;
            });
          }

          const groups = change.changes.reduce((a, b) => Object.assign(a, { [b.type]: [].concat(a[b.type] || [], b) }), {});
          change.changes = Object.keys(groups).reduce((c, d) => [].concat(c, groups[d]), []);
          return change;
        });
      })
    );
  }

  parseVersion(version: string) {
    return String(version)?.replace(/\./g, '_');
  }

  parseDateFomNow(time: number) {
    return moment(new Date(time * 1e3)).fromNow();
  }

  parseDate(time: number) {
    return new Date(time * 1e3).toDateString();
  }

  parseDescriptionType(description: string, project?: string) {
    description = description ?? '';

    if (description.length) {
      description = `[${project}] ${description}`;
    }

    return description.replace(/\[([^\]]+)\]/g, '<span class="badge badge-light">$1</span>');
  }

}
