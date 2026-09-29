"""Native smoke check. Requires WECHATIDE_TOKEN_FILE; never prints the token."""
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent.parent
TOKEN = Path(os.environ['WECHATIDE_TOKEN_FILE']).read_text().strip()
REPORT = []

def call(tool, **options):
    command = ['wechatide', '-c', 'Codex', tool, '--project', str(ROOT), '--token', TOKEN]
    for key, value in options.items():
        command += ['--' + key.replace('_', '-'), json.dumps(value, ensure_ascii=False) if isinstance(value, (dict, list)) else str(value)]
    result = subprocess.run(command, capture_output=True, text=True, timeout=50)
    output = result.stdout
    try:
        data = json.loads(output[output.index('{'):])
    except (ValueError, json.JSONDecodeError):
        raise RuntimeError(tool + ': response could not be parsed') from None
    if result.returncode or not data.get('ok'):
        raise RuntimeError(tool + ': ' + str(data.get('message', 'failed')))
    value = data.get('result')
    while isinstance(value, dict) and 'result' in value:
        value = value['result']
    return value

def evaluate(source, args=None):
    options = {'fn_source': source}
    if args is not None:
        options['args'] = args
    return call('automation_evaluate', **options)

def tap(selector):
    return call('automation_element_action', selector=selector, action='tap', wait=1)

def cell(index):
    return call('automation_element_action', selector='sudoku-board', action='trigger', type='celltap', detail={'index':index})

def page():
    return evaluate('function(){var p=getCurrentPages();return p[p.length-1].data;}')

def note(text):
    REPORT.append(text)
    print(text, flush=True)

catalog = json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./miniprogram/data/lessons').courses))"], cwd=ROOT, text=True))
backup = evaluate("function(){return {progress:wx.getStorageSync('shudu:v1:progress'),game:wx.getStorageSync('shudu:v1:game')};}")
try:
    for course in catalog:
        lesson = next(l for l in course['lessons'] if l['mode']=='independent')
        call('automation_navigate', action='reLaunch', url='/pages/training/training?course='+course['id']+'&id='+lesson['id'])
        for index in lesson['pattern']['cells']:
            cell(index)
        tap('[data-phase="elimination"]')
        target = lesson['pattern']['eliminations'][0]
        cell(target['cell'])
        tap('[data-digit="'+str(target['digit'])+'"]')
        tap('#check-answer')
        state = page()
        assert state['done'] and '通过' in state['message'], course['id']
        note(course['title'] + ': native structure selection and submission passed')
    call('automation_navigate', action='switchTab', url='/pages/play/play')
    # The page restores a previous game; choose the first puzzle only when no saved game exists.
    state = page()
    if not state.get('game'):
        tap('[data-id="puzzle-1"]')
    elif state['game']['paused'] and not state['game']['solved']:
        tap('.pause-panel .primary')
    state=page()
    if not state['game']['solved']:
        index=state['game']['board'].index(0)
        cell(index)
        tap('.tools button:first-child')
        tap('[data-digit="1"]')
        assert 1 in page()['game']['notes'][index]
        tap('.tools button:nth-child(3)')
        assert 1 not in page()['game']['notes'][index]
        tap('.tools button:nth-child(4)')
        assert page()['game']['paused']
        note('自由玩: native note, undo and pause passed')
    for name in ['home','course','training','play']:
        call('compile_wxml', file_path=f'pages/{name}/{name}.wxml')
    call('compile_wxml', file_path='components/board/board.wxml')
    note('All native WXML templates compiled')
finally:
    evaluate("function(saved){['progress','game'].forEach(function(k){var key='shudu:v1:'+k;if(saved[k]==='')wx.removeStorageSync(key);else wx.setStorageSync(key,saved[k]);});}",[backup])
    call('automation_navigate', action='reLaunch', url='/pages/home/home')
    (ROOT/'artifacts').mkdir(exist_ok=True)
    (ROOT/'artifacts'/'native-smoke.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2)+'\n')
