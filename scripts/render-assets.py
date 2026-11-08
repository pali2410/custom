"""Render GitHub-compatible isometric calendar artwork from the API snapshot."""
import json, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root=Path(__file__).resolve().parents[1]
data=json.loads((root/'public/data/github.json').read_text())
days=[day for week in data['calendar']['weeks'] for day in week['contributionDays']]
out=root/'public/images';out.mkdir(parents=True,exist_ok=True)
palette=['#303d35','#6d8848','#a2b75c','#d2d88b','#e1bb70']
def shade(c,f):
 return tuple(int(int(c[i:i+2],16)*f) for i in (1,3,5))
def frame(progress):
 im=Image.new('RGB',(1200,540),'#141e17');d=ImageDraw.Draw(im)
 try:
  font=ImageFont.truetype('DejaVuSans.ttf',16);large=ImageFont.truetype('DejaVuSans.ttf',36)
 except OSError:
  font=ImageFont.load_default(size=16);large=ImageFont.load_default(size=36)
 d.text((52,35),'pali2410 / DEVELOPER UNIVERSE',font=font,fill='#b5c798')
 d.text((52,70),'A world, built one commit at a time.',font=large,fill='#e1e8d6')
 # The same day-to-height square-root scale as the live scene.
 for i,day in enumerate(days):
  week,row=divmod(i,7);count=day['contributionCount'];levels=min(14,1+math.ceil(math.sqrt(count)*1.15)) if count else 1
  x=130+week*17-row*10;y=200+week*3.1+row*12;h=levels*7*max(.03,min(1,progress*1.6-i/len(days)*.5))
  c=palette[0 if count==0 else min(4,math.ceil(count/20))]
  d.polygon([(x,y),(x+15,y+2.7),(x+15,y-h+2.7),(x,y-h)],fill=shade(c,.62))
  d.polygon([(x+15,y+2.7),(x+6,y+13),(x+6,y-h+13),(x+15,y-h+2.7)],fill=shade(c,.8))
  d.polygon([(x,y-h),(x+15,y-h+2.7),(x+6,y-h+13),(x-9,y-h+10)],fill=c)
  d.ellipse((x-1,y-h+3,x+5,y-h+8),fill=shade(c,.95))
 d.text((52,457),f"{data['calendar']['totalContributions']:,} contributions / {days[0]['date']} - {days[-1]['date']}",font=font,fill='#b8c7a7')
 d.text((52,490),'Real GitHub activity. Explore the interactive universe at pali2410.github.io/custom/',font=font,fill='#8c9e7c')
 return im
frame(1).save(out/'contribution-landscape.png',optimize=True)
frames=[frame(i/23) for i in range(24)]
frames[0].save(out/'contribution-assembly.gif',save_all=True,append_images=frames[1:],duration=[80]*23+[2400],loop=0,optimize=True)
print(f'Rendered PNG + animated GIF using {len(days)} actual dates.')
