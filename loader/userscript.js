// ==UserScript==
// @name         Granblue Search for リアルタイム検索
// @namespace    https://totoraj.net
// @version      0.1
// @description  Yahoo!リアルタイム検索をグラブルのツイ救援用に改造するやつ
// @author       totoraj
// @match        https://search.yahoo.co.jp/realtime*
// @grant        none
// ==/UserScript==

/*
  連絡先: @totoraj_game

  外部に設置しているスクリプトを読み込むので更新不要です。
*/

const $script = document.createElement('script');
$script.src = 'https://gbs-rt.eriri.net/public/script/index.global.js';
document.body.append($script);
