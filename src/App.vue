<template>
  <div id="app">
    <h1>List Repos : Show Your All GitHub Repositories</h1>
    <form>
      <input type="text" v-model="user" placeholder="User Name" v-bind:disabled="isProcessing">
      <input type="submit" v-on:click.stop.prevent="fetch" v-bind:disabled="isProcessing || user == null || user.trim() === ''" value="Show">
      <a v-show="sort.user" v-bind:href="'https://github.com/' + sort.user + '?tab=repositories'" target="_blank">{{ sort.user }}</a>
      <input type="text" v-model="token" placeholder="GitHub Token" v-bind:disabled="isProcessing">
      <small v-show="rate" v-bind:title="allRateInfo">{{ rate }}</small>
    </form>
    
    <p v-if="isProcessing" class="warning">Fetching...</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    
    <!-- エラー時も表示する -->
    <p v-if="!isProcessing && (!repos || !repos.length)" class="warning">Repository Not Found.</p>
    <div v-if="!isProcessing && repos && repos.length" class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th v-on:click.stop="sortBy('name'     , 'toString' )"><span class="hidden">■</span>Name<span     v-if="sort.activeColumn !== 'name'             " class="hidden">■</span><span v-if="sort.activeColumn === 'name'              && sort.name"              class="is-desc">▼</span><span v-if="sort.activeColumn === 'name'              && !sort.name"              class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('homepage' , 'toBoolean')"><span class="hidden">■</span>HP<span       v-if="sort.activeColumn !== 'homepage'         " class="hidden">■</span><span v-if="sort.activeColumn === 'homepage'          && sort.homepage"          class="is-desc">▼</span><span v-if="sort.activeColumn === 'homepage'          && !sort.homepage"          class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('clone_url', 'toBoolean')"><span class="hidden">■</span>Git<span      v-if="sort.activeColumn !== 'clone_url'        " class="hidden">■</span><span v-if="sort.activeColumn === 'clone_url'         && sort.clone_url"         class="is-desc">▼</span><span v-if="sort.activeColumn === 'clone_url'         && !sort.clone_url"         class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('fork'     , 'toBoolean')"><span class="hidden">■</span>Fork<span     v-if="sort.activeColumn !== 'fork'             " class="hidden">■</span><span v-if="sort.activeColumn === 'fork'              && sort.fork"              class="is-desc">▼</span><span v-if="sort.activeColumn === 'fork'              && !sort.fork"              class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('archived' , 'toBoolean')"><span class="hidden">■</span>Archived<span v-if="sort.activeColumn !== 'archived'         " class="hidden">■</span><span v-if="sort.activeColumn === 'archived'          && sort.archived"          class="is-desc">▼</span><span v-if="sort.activeColumn === 'archived'          && !sort.archived"          class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('language' , 'toString' )"><span class="hidden">■</span>Language<span v-if="sort.activeColumn !== 'language'         " class="hidden">■</span><span v-if="sort.activeColumn === 'language'          && sort.language"          class="is-desc">▼</span><span v-if="sort.activeColumn === 'language'          && !sort.language"          class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('created_at'            )"><span class="hidden">■</span>Created<span  v-if="sort.activeColumn !== 'created_at'       " class="hidden">■</span><span v-if="sort.activeColumn === 'created_at'        && sort.created_at"        class="is-desc">▼</span><span v-if="sort.activeColumn === 'created_at'        && !sort.created_at"        class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('updated_at'            )"><span class="hidden">■</span>Updated<span  v-if="sort.activeColumn !== 'updated_at'       " class="hidden">■</span><span v-if="sort.activeColumn === 'updated_at'        && sort.updated_at"        class="is-desc">▼</span><span v-if="sort.activeColumn === 'updated_at'        && !sort.updated_at"        class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('pushed_at'             )"><span class="hidden">■</span>Pushed<span   v-if="sort.activeColumn !== 'pushed_at'        " class="hidden">■</span><span v-if="sort.activeColumn === 'pushed_at'         && sort.pushed_at"         class="is-desc">▼</span><span v-if="sort.activeColumn === 'pushed_at'         && !sort.pushed_at"         class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('open_issues_count'     )"><span class="hidden">■</span>Issues<span   v-if="sort.activeColumn !== 'open_issues_count'" class="hidden">■</span><span v-if="sort.activeColumn === 'open_issues_count' && sort.open_issues_count" class="is-desc">▼</span><span v-if="sort.activeColumn === 'open_issues_count' && !sort.open_issues_count" class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('stargazers_count'      )"><span class="hidden">■</span>Stars<span    v-if="sort.activeColumn !== 'stargazers_count' " class="hidden">■</span><span v-if="sort.activeColumn === 'stargazers_count'  && sort.stargazers_count"  class="is-desc">▼</span><span v-if="sort.activeColumn === 'stargazers_count'  && !sort.stargazers_count"  class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('forks_count'           )"><span class="hidden">■</span>Forks<span    v-if="sort.activeColumn !== 'forks_count'      " class="hidden">■</span><span v-if="sort.activeColumn === 'forks_count'       && sort.forks_count"       class="is-desc">▼</span><span v-if="sort.activeColumn === 'forks_count'       && !sort.forks_count"       class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('size'                  )"><span class="hidden">■</span>Size<span     v-if="sort.activeColumn !== 'size'             " class="hidden">■</span><span v-if="sort.activeColumn === 'size'              && sort.size"              class="is-desc">▼</span><span v-if="sort.activeColumn === 'size'              && !sort.size"              class="is-asc">▲</span></th>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <th>No</th>
            <th v-on:click.stop="sortBy('name'     , 'toString' )"><span class="hidden">■</span>Name<span     v-if="sort.activeColumn !== 'name'             " class="hidden">■</span><span v-if="sort.activeColumn === 'name'              && sort.name"              class="is-desc">▼</span><span v-if="sort.activeColumn === 'name'              && !sort.name"              class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('homepage' , 'toBoolean')"><span class="hidden">■</span>HP<span       v-if="sort.activeColumn !== 'homepage'         " class="hidden">■</span><span v-if="sort.activeColumn === 'homepage'          && sort.homepage"          class="is-desc">▼</span><span v-if="sort.activeColumn === 'homepage'          && !sort.homepage"          class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('clone_url', 'toBoolean')"><span class="hidden">■</span>Git<span      v-if="sort.activeColumn !== 'clone_url'        " class="hidden">■</span><span v-if="sort.activeColumn === 'clone_url'         && sort.clone_url"         class="is-desc">▼</span><span v-if="sort.activeColumn === 'clone_url'         && !sort.clone_url"         class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('fork'     , 'toBoolean')"><span class="hidden">■</span>Fork<span     v-if="sort.activeColumn !== 'fork'             " class="hidden">■</span><span v-if="sort.activeColumn === 'fork'              && sort.fork"              class="is-desc">▼</span><span v-if="sort.activeColumn === 'fork'              && !sort.fork"              class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('archived' , 'toBoolean')"><span class="hidden">■</span>Archived<span v-if="sort.activeColumn !== 'archived'         " class="hidden">■</span><span v-if="sort.activeColumn === 'archived'          && sort.archived"          class="is-desc">▼</span><span v-if="sort.activeColumn === 'archived'          && !sort.archived"          class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('language' , 'toString' )"><span class="hidden">■</span>Language<span v-if="sort.activeColumn !== 'language'         " class="hidden">■</span><span v-if="sort.activeColumn === 'language'          && sort.language"          class="is-desc">▼</span><span v-if="sort.activeColumn === 'language'          && !sort.language"          class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('created_at'            )"><span class="hidden">■</span>Created<span  v-if="sort.activeColumn !== 'created_at'       " class="hidden">■</span><span v-if="sort.activeColumn === 'created_at'        && sort.created_at"        class="is-desc">▼</span><span v-if="sort.activeColumn === 'created_at'        && !sort.created_at"        class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('updated_at'            )"><span class="hidden">■</span>Updated<span  v-if="sort.activeColumn !== 'updated_at'       " class="hidden">■</span><span v-if="sort.activeColumn === 'updated_at'        && sort.updated_at"        class="is-desc">▼</span><span v-if="sort.activeColumn === 'updated_at'        && !sort.updated_at"        class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('pushed_at'             )"><span class="hidden">■</span>Pushed<span   v-if="sort.activeColumn !== 'pushed_at'        " class="hidden">■</span><span v-if="sort.activeColumn === 'pushed_at'         && sort.pushed_at"         class="is-desc">▼</span><span v-if="sort.activeColumn === 'pushed_at'         && !sort.pushed_at"         class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('open_issues_count'     )"><span class="hidden">■</span>Issues<span   v-if="sort.activeColumn !== 'open_issues_count'" class="hidden">■</span><span v-if="sort.activeColumn === 'open_issues_count' && sort.open_issues_count" class="is-desc">▼</span><span v-if="sort.activeColumn === 'open_issues_count' && !sort.open_issues_count" class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('stargazers_count'      )"><span class="hidden">■</span>Stars<span    v-if="sort.activeColumn !== 'stargazers_count' " class="hidden">■</span><span v-if="sort.activeColumn === 'stargazers_count'  && sort.stargazers_count"  class="is-desc">▼</span><span v-if="sort.activeColumn === 'stargazers_count'  && !sort.stargazers_count"  class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('forks_count'           )"><span class="hidden">■</span>Forks<span    v-if="sort.activeColumn !== 'forks_count'      " class="hidden">■</span><span v-if="sort.activeColumn === 'forks_count'       && sort.forks_count"       class="is-desc">▼</span><span v-if="sort.activeColumn === 'forks_count'       && !sort.forks_count"       class="is-asc">▲</span></th>
            <th v-on:click.stop="sortBy('size'                  )"><span class="hidden">■</span>Size<span     v-if="sort.activeColumn !== 'size'             " class="hidden">■</span><span v-if="sort.activeColumn === 'size'              && sort.size"              class="is-desc">▼</span><span v-if="sort.activeColumn === 'size'              && !sort.size"              class="is-asc">▲</span></th>
          </tr>
        </tfoot>
        <tbody>
          <tr v-for="(repo, index) in repos" v-bind:key="repo.id">
            <td class="monospace text-right">{{ String(index + 1).replace((/(\d)(?=(\d\d\d)+(?!\d))/gu), '$1,') }}</td>
            <td><a v-bind:href="repo.html_url" target="_blank" v-bind:title="repo.description">{{ repo.name }}</a></td>
            <td class="text-center"><a v-if="repo.homepage" v-bind:href="repo.homepage"  v-bind:title="repo.homepage" target="_blank">○</a><span v-else>-</span></td>
            <td class="text-center"><a                      v-bind:href="repo.clone_url"                              target="_blank">■</a></td>
            <td class="text-center"><a v-bind:href="repo.html_url + '/network/members'" target="_blank"><template v-if="repo.fork">○</template><template v-else>-</template></a></td>
            <td class="text-center"><template v-if="repo.archived">○</template><template v-else>-</template></td>
            <td><span class="language-icon" v-bind:style="'background:' + getColour(repo.language)"></span><span class="language-name">{{ repo.language || '-' }}</span></td>
            <td v-bind:title="repo.created_at" class="monospace text-center">{{ repo.created_at.slice(0, 10) }}</td>
            <td v-bind:title="repo.updated_at" class="monospace text-center">{{ repo.updated_at.slice(0, 10) }}</td>
            <td v-bind:title="repo.pushed_at"  class="monospace text-center">{{ repo.pushed_at .slice(0, 10) }}</td>
            <td class="text-right"><a v-bind:href="repo.html_url + '/issues'"          target="_blank">{{ String(repo.open_issues_count).replace((/(\d)(?=(\d\d\d)+(?!\d))/gu), '$1,') }}</a></td>
            <td class="text-right"><a v-bind:href="repo.html_url + '/stargazers'"      target="_blank">{{ String(repo.stargazers_count ).replace((/(\d)(?=(\d\d\d)+(?!\d))/gu), '$1,') }}</a></td>
            <td class="text-right"><a v-bind:href="repo.html_url + '/network/members'" target="_blank">{{ String(repo.forks_count      ).replace((/(\d)(?=(\d\d\d)+(?!\d))/gu), '$1,') }}</a></td>
            <td class="monospace text-right">{{ String(repo.size).replace((/(\d)(?=(\d\d\d)+(?!\d))/gu), '$1,') }}<small>&nbsp;kb</small></td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <footer>Author : <a href="https://neos21.net/" target="_blank">Neo</a> (<a href="https://github.com/Neos21/list-repos" target="_blank">GitHub</a>)</footer>
  </div>
</template>

<style>
:root {
  --margin: 1rem;
  --item-border-colour          : #d2d4d6;
  --item-background-colour      : #f2f4f6;
  --item-background-hover-colour: #eceef0;
  --item-padding-y: .25rem;
  --item-padding-x: .5rem;
}

*, ::before, ::after { box-sizing: border-box; }
@font-face { font-family: "Yu Gothic"; src: local("Yu Gothic Medium"), local("YuGothic-Medium");                    }
@font-face { font-family: "Yu Gothic"; src: local("Yu Gothic Bold"  ), local("YuGothic-Bold"  ); font-weight: bold; }
html {
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, "Noto Sans CJK JP", YuGothic, "Yu Gothic", "Hiragino Sans", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  overflow-y: scroll;
  color: #020406;
  text-decoration-skip-ink: none;
  line-height: 1;
  background: #fdfeff;
  cursor: default;
  -webkit-text-size-adjust: 100%;
  -webkit-text-decoration-skip: objects;
  -webkit-overflow-scrolling: touch;
}

body {
  margin: var(--margin);
  overflow-wrap: break-word;
      word-wrap: break-word;
}
  @media (max-width: 575.98px) {
    body {
      word-break: break-all;
    }
  }

a {
  color: #07f;
  text-decoration: none;
}
  a:hover {
    text-decoration: underline;
  }

h1 {
  margin: 0;
  font-size: 1.5rem;
}

form {
  margin: var(--margin) 0;
  white-space: nowrap;
  overflow-x: auto;
}
  form > *:not(:last-child) {
    margin-right: .75rem;
  }
  /* レート制限表示 (ツールチップで全情報表示) */
  form > small:hover {
    text-decoration: underline;
    cursor: help;
  }

input {
  margin: 0;
  border: 1px solid var(--item-border-colour);
  border-radius: 4px;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}
  input:disabled {
    cursor: not-allowed;
  }

[type="text"] {
  padding: var(--item-padding-y) var(--item-padding-x);
  width: 12rem;
}
  [type="text"]:disabled {
    color: #495057;
    background: #e9ecef;
  }

[type="submit"] {
  padding: var(--item-padding-y) .75rem;
  background: var(--item-background-colour);
  cursor: pointer;
  -webkit-appearance: button;
}
  [type="submit"]:hover {
    background: var(--item-background-hover-colour);
  }
  [type="submit"]:disabled {
    color: #929496;
    background: #e2e4e6;
  }

p {
  margin: var(--margin) 0;
  font-weight: bold;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
}

tr:hover, tr:focus {
  background: #f4f6f8;
}

th {
  border: 1px solid var(--item-border-colour);
  padding: var(--item-padding-y) 0;
  text-align: center;
  font-weight: bold;
  background: var(--item-background-colour);
  white-space: nowrap;
}
  th:hover, th:focus {
    background: var(--item-background-hover-colour);
  }
  
  /* No 列のみソートが効かないので余白を調整する */
  th:first-child {
    padding: var(--item-padding-y) var(--item-padding-x);
  }
  
  th:not(:first-child) {
    cursor: pointer;
  }
  
  /* アイコン */
  th span {
    display: inline-block;
    width: 1.1rem;
    color: #909294;
    font-size: .8rem;
    text-align: center;
  }

td {
  border: 1px solid var(--item-border-colour);
  padding: var(--item-padding-y) var(--item-padding-x);
  white-space: nowrap;
}

small {
  font-size: .8rem;
}

.language-icon {
  display: inline-block;
  margin-right: .3rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #666;  /* Default */
}

.language-name {
  font-size: .9rem;
}

.monospace {
  font-family: "Noto Sans Mono CJK JP", Osaka-mono, "MS Gothic", Menlo, Consolas, Courier, "Courier New", monospace, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.text-center { text-align: center; }
.text-right  { text-align: right ; }
.warning { color: #cb0; }
.error   { color: #f00; }
.hidden { visibility: hidden; }

footer {
  margin: calc(var(--margin) * 2) 0;
  border-top: 1px solid var(--item-border-colour);
  padding-top: var(--margin);
  font-size: .9rem;
}
</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import colours from './colours.json';

/**
 * クエリ文字列をオブジェクトにパースする
 * 
 * @param locationSearch `location.search` を渡す
 * @return クエリの連想配列
 */
const parseQueryString = (locationSearch: string): { [key: string]: string } => {
  if(typeof locationSearch !== 'string' || locationSearch === '') return {};
  return locationSearch.replace((/^\?/u), '').split('&').reduce((obj: { [key: string]: string }, param: string) => {
    const [key, value] = param.split('=');
    obj[key] = value;
    return obj;
  }, {});
};

/**
 * GitHub API が返す `link` ヘッダをパースする
 * 
 * @param link `link` ヘッダの文字列
 * @return リンクの連想配列 (キーが 'first'・'prev'・'next'・'last' のいずれか、値が API URL となる)
 */
const parseLinks = (link: string | null): Links => {
  if(link == null || typeof link !== 'string' || link === '') return {};
  return link.split(', ').reduce((links: { [key: string]: string }, part: string) => {
    const match = part.match('<(.*?)>; rel="(.*?)"');
    if(match && match.length === 3) links[match[2]] = match[1];  // ex. 'next': https://api.github.com/user/00000000/repos?per_page=100&page=2
    return links;
  }, {});
};

/**
 * GitHub Token の有無に応じて `window.fetch` の第2引数用のオブジェクトを組み立てる
 * 
 * @param token GitHub Token
 * @return GitHub Token がない場合は `undefined`、あれば `headers.Authorization` オプションを持つ連想配列
 */
const convertToFetchOptions = (token?: string): { headers: { Authorization: string } } | undefined => (token == null || token.trim() === '')
  ? undefined
  : { headers: { Authorization: `Bearer ${token}` } };

/**
 * `window.fetch()` でリポジトリ情報を取得し結果を返す
 * 
 * @param url GitHub API URL
 * @param token GitHub Token
 * @return `link` ヘッダの内容と取得できたリポジトリ情報の配列をまとめたオブジェクト
 * @throws API コールに失敗した場合に例外をスローする
 */
const fetchRepositories = async (url: string, token?: string): Promise<GitHubApiRepositories> => {
  const options = convertToFetchOptions(token);
  const response = await fetch(url, options);  // .ok = true, .status = 200, .statusText = 'OK'
  if(!response.ok) {  // 例外は自動的にはスローされない
    console.warn('fetchRepositories : Response NG', response);
    throw new Error(`${response.status} : ${response.statusText}`);
  }
  const link = response.headers.get('link');  // `string | null`
  const links: Links = parseLinks(link);
  const repos: Array<object> = await response.json();
  const gitHubApiRepositories: GitHubApiRepositories = { links, repos };
  return gitHubApiRepositories;
};

/**
 * `window.fetch()` で GitHub API のコールレート情報を取得し結果を返す
 * 
 * @param token GitHub Token
 * @return コールレート情報の結果オブジェクト
 * @throws API コールに失敗した場合に例外をスローする
 */
const fetchRateLimit = async (token?: string): Promise<GitHubApiRateLimit> => {
  const options = convertToFetchOptions(token);
  const response = await fetch('https://api.github.com/rate_limit', options);
  if(!response.ok) {
    console.warn('fetchRateLimit : Response NG', response);
    throw new Error(`${response.status} : ${response.statusText}`);
  }
  const jsonResponse = await response.json();
  const rate: GitHubApiRateLimit = jsonResponse.rate;
  return rate;
};

/** リンクのインターフェース */
interface Links {
  /** 最初の URL */
  first?: string;
  /** 1つ前の URL */
  prev? : string;
  /** 1つ次の URL */
  next? : string;
  /** 最後の URL */
  last? : string;
}

/** GitHub API で取得したリポジトリの配列のインターフェース */
interface GitHubApiRepositories {
  /** `link` ヘッダの情報 */
  links?: Links;
  /** リポジトリ情報 */
  repos: Array<object>;
}

/** GitHub API で取得したレートリミットのインターフェース */
interface GitHubApiRateLimit {
  limit?    : number;
  used?     : number;
  remaining?: number;
  reset?    : number;
}

/** アプリ */
@Component({})
export default class App extends Vue {
  /** ユーザ名 */
  private user: string = 'Neos21';
  /** GitHub Token */
  private token: string = '';
  /** リポジトリ情報 */
  private repos: Array<object> = [];
  
  /** API コールレート制限 (値がある場合は `remaining / limit` の形式で表示する) */
  private rate: string = '';
  /** API コールレートの全ての情報 (ツールチップ表示用) */
  private allRateInfo: string = '';
  
  /** 処理中かどうか */
  private isProcessing: boolean = false;
  /** エラーメッセージ */
  private errorMessage: string = '';
  
  /** ソート状況 : `activeColumn` にソート中のプロパティ名・各プロパティは `true` なら昇順・`false` なら降順とする */
  private sort: any = {
    user             : '',
    activeColumn     : '',
    name             : null,
    homepage         : null,
    clone_url        : null,
    fork             : null,
    archived         : null,
    language         : null,
    created_at       : null,
    updated_at       : null,
    pushed_at        : null,
    open_issues_count: null,
    stargazers_count : null,
    forks_count      : null,
    size             : null
  };
  
  /** 画面初期表示時 : クエリ文字列でユーザ名や GitHub Token が指定されていたらそれを初期設定する */
  private async mounted(): Promise<void> {
    const params = parseQueryString(location.search);
    if(params.user ) this.user  = params.user;
    if(params.token) this.token = params.token;
    await this.fetch();
  }
  
  /** GitHub API からリポジトリ一覧を取得する */
  private async fetch(): Promise<void> {
    try {
      const user  = this.user;
      const token = this.token;
      history.pushState(null, '', `?user=${user}${token ? '&token=' + token : ''}`);
      this.isProcessing = true;
      this.errorMessage = '';
      this.repos        = [];
      
      const repos = [];
      let pageNumber = 1;
      try {
        let url = `https://api.github.com/users/${user}/repos?per_page=100&page=1`;
        while(url !== '') {
          const foundRepos = await fetchRepositories(url, token);  // Throws
          console.log(`[${new Date().toISOString()}] Fetching : [Page ${pageNumber}] [${foundRepos.repos.length} Repos] [${foundRepos.links && foundRepos.links.next ? 'Has Next' : 'End'}]`);
          repos.push(...foundRepos.repos);
          url = foundRepos.links && foundRepos.links.next ? foundRepos.links.next : '';
          pageNumber++;
        }
      }
      catch(fetchRepositoriesError) {
        console.warn('Error Has Occurred In Fetch Repositories Loop', fetchRepositoriesError);
        throw fetchRepositoriesError;  // 以下の `finally` を実行後に外側の `catch` に移る
      }
      finally {
        console.log(`Fetched Repositories : [${pageNumber} Pages] [${repos.length} Repos]`, repos);
        
        // API コールレート制限を取得する
        try {
          const rate = await fetchRateLimit(token);  // Throws
          console.log('Rate Limit', rate);
          this.rate = `${rate.remaining} / ${rate.limit}`;
          this.allRateInfo = Object.entries(rate).map(([key, value]) => {
            if(key !== 'reset') return `${key} : ${value}`;
            const jstReset = new Date(value * 1000 + 32400000)  // `* 1000` = Seconds To Milliseconds , `+ 32400000` = 9 Hours To Milliseconds (JST)
              .toISOString()                     // `ISO` But Gets JST
              .replace((/[TZ]/g), ' ') + 'JST';  // `YYYY-MM-DD HH:mm:SS.sss JST`
            return `${key} : ${value} (${jstReset})`;
          }).join(' , ');
        }
        catch(rateLimitError) {  // 万が一エラーが発生した場合は空白表示とする
          console.warn('Failed To Fetch Rate Limit', rateLimitError);
          this.rate        = '';
          this.allRateInfo = '';
        }
        
        // エラーが発生した場合もそれまでの取得分は表示する
        this.repos = repos;
        this.sort  = {
          user             : user,
          activeColumn     : '',
          name             : false,  // `this.sortBy()` で昇順になるよう、先に降順設定を与えておく
          homepage         : null,
          clone_url        : null,
          fork             : null,
          archived         : null,
          language         : null,
          created_at       : null,
          updated_at       : null,
          pushed_at        : null,
          open_issues_count: null,
          stargazers_count : null,
          forks_count      : null,
          size             : null
        };
        this.sortBy('name', 'toString');  // 通常名前の昇順で取得できるが、強制的にソートしておく
      }
    }
    catch(error) {
      console.warn('fetch() : Failed', error);
      this.errorMessage = `Failed To Fetch Data : ${error}`;
    }
    finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * ソートする
   * 
   * @param propertyName プロパティ名 (GitHub API のプロパティ名と合わせる)
   * @param mode モード・`toString` を指定すると小文字に統一して比較・`toBoolean` にするとブール値 (値の有無など) で比較する
   */
  private sortBy(propertyName: string, mode?: 'toString' | 'toBoolean'): void {
    this.sort.activeColumn = propertyName;
    this.sort[propertyName] = this.sort[propertyName] == null ? false : !this.sort[propertyName];
    this.repos.sort((a: any, b: any) => {
      let aProperty = a[propertyName];
      let bProperty = b[propertyName];
      if(mode === 'toString') {  // `null`・`undefined` 対策
        aProperty = (aProperty ?? '').toLowerCase();
        bProperty = (bProperty ?? '').toLowerCase();
      }
      else if(mode === 'toBoolean') {
        aProperty = Boolean(aProperty);
        bProperty = Boolean(bProperty);
      }
      
      if(this.sort[propertyName]) {  // 昇順
        if(aProperty > bProperty) { return  1; }
        if(aProperty < bProperty) { return -1; }
      }
      else {  // 降順
        if(aProperty > bProperty) { return -1; }
        if(aProperty < bProperty) { return  1; }
      }
      return 0;
    });
  }
  
  /**
   * プログラミング言語名を基にカラーコードを返す
   * 
   * `import` している `colours.json` は以下の URL より取得・整形したモノ
   * `{ "言語名": "#カラーコード" }` となっているのでカラーコードを取得できたらそれを返す
   * カラーコードが取得できなかった場合は空値とし、`.language-icon` のデフォルトカラーで表示させる
   * 
   * - https://github.com/ozh/github-colors/blob/master/colors.json
   * - https://raw.githubusercontent.com/ozh/github-colors/master/colors.json
   * 
   * @param languageName プログラミング言語名
   * @return カラーコード・見つからなければ空文字
   */
  private getColour(languageName?: string): string {
    if(languageName == null) return '';
    const colour = (colours as any)[languageName];
    if(colour == null) return '';
    return colour;
  }
}
</script>
