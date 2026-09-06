"""Deterministic artifact contract. Run: python -m unittest discover -s tests -v"""
import json, re, unittest
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
ROOT = Path(__file__).resolve().parents[1]

class HTML(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.slides=[]; self.links=[]; self.ids=[]; self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'slide' in a.get('class','').split(): self.slides.append(a)
        if 'id' in a: self.ids.append(a['id'])
        for k in ['href','src']:
            if k in a: self.links.append(a[k])

class Materials(unittest.TestCase):
    def load(self):
        self.assertTrue((ROOT/'curriculum.json').is_file(), 'authoritative curriculum missing')
        return json.loads((ROOT/'curriculum.json').read_text())
    def test_minutes_counts(self):
        c=self.load(); self.assertEqual(len(c['sessions']),2)
        for session,count in zip(c['sessions'],[28,18]):
            self.assertEqual(len(session['slides']),count)
            self.assertEqual(sum(x['minutes'] for x in session['slides']),120)
            self.assertEqual([x['number'] for x in session['slides']], list(range(1,count+1)))
            self.assertTrue(all(x['minutes']>0 for x in session['slides']))
    def test_title_script_agreement(self):
        for s in self.load()['sessions']:
            text=(ROOT/f"session-{s['id']}.html").read_text()
            deck=HTML(text).slides
            script=(ROOT/f"scripts-session-{s['id']}.md").read_text()
            titles=re.findall(r'^## (\d+)\. (.+)$',script,re.M)
            times=re.findall(r'\*\*권장 시간: (\d+)분',script)
            self.assertEqual(len(deck),len(s['slides']))
            self.assertEqual(len(titles),len(deck)); self.assertEqual(len(times),len(deck))
            for d,t,m,x in zip(deck,titles,times,s['slides']):
                self.assertEqual(d['data-title'],x['title']); self.assertEqual(t,(f"{x['number']:02}",x['title']))
                self.assertEqual(int(m),x['minutes']); self.assertEqual(int(d['data-minutes']),x['minutes'])
            self.assertEqual(script.count('### 진행 멘트'),len(deck))
            self.assertEqual(script.count('### 전환'),len(deck))
            self.assertEqual(script.count('### 질문 / 직접 할 동작'),len(deck))
    def test_required_surfaces_and_safety(self):
        for name in ['index','session-1','session-2','worksheet-1','worksheet-2','homework','lab','facilitator-guide']:
            path=ROOT/f'{name}.html'; self.assertTrue(path.exists(),name)
            text=path.read_text()
            for notice in ['민감정보','자동 실행','설정','합성']:
                self.assertIn(notice,text,name)
        for n in ['worksheet-1','worksheet-2']:
            text=(ROOT/f'{n}.html').read_text()
            for marker in ['data-field','exportText','exportJson','importJson','local','샌드박스']:
                self.assertIn(marker,text)
        guide=(ROOT/'facilitator-guide.html').read_text()
        for term in ['도구 권한 검증 미완료','실제 실행','대체 연습','파일','네트워크','명령','보존','중단']:
            self.assertIn(term,guide)
    def test_local_links_and_duplicate_ids(self):
        files=list(ROOT.glob('*.html')); self.assertGreaterEqual(len(files),8)
        for p in files:
            parsed=HTML(p.read_text()); self.assertEqual(len(parsed.ids),len(set(parsed.ids)),p.name)
            for link in parsed.links:
                u=urlsplit(link)
                if u.scheme or u.netloc: continue
                target=(p.parent/unquote(u.path)).resolve() if u.path else p
                self.assertTrue(target.is_relative_to(ROOT),str(target))
                self.assertTrue(target.exists(),f'{p.name}: {link}')
                if u.fragment and not u.fragment.isdigit() and target.suffix=='.html':
                    self.assertIn(u.fragment,HTML(target.read_text()).ids,f'{p.name}: {link}')
    def test_no_auto_ai_connection(self):
        for p in ROOT.glob('*.js'):
            text=p.read_text()
            self.assertNotRegex(text,r'\b(fetch|XMLHttpRequest|WebSocket)\s*\(',p.name)
        self.assertTrue((ROOT/'lab-samples/inbox-03.txt').exists())
        self.assertTrue((ROOT/'lab-samples/faulty-output.txt').exists())

if __name__=='__main__': unittest.main()
