// Reader factory for Noma 0.23. Individual stories remain fixed; no AI calls or user data.
globalThis.NOMA_PACK_READERS=globalThis.NOMA_PACK_READERS||{};
globalThis.NOMA_BUILD_READERS=function(packId, rows){
  const names=['Emma','Daniel','Maya','Oliver','Nora','Lucas','Sofia','Sam','Clara','Leo'];
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const cues=[
    'There was enough time to think carefully, but not enough time to ignore the situation.',
    'The details mattered more than anyone had expected at the beginning.',
    'One small misunderstanding could have caused a much bigger problem later.',
    'The easiest choice was not necessarily the most useful one.',
    'A little preparation helped, although it did not solve everything.',
    'The situation was different from the one described in the original plan.'
  ];
  const fillers=[
    'Rather than assume that everything would be fine, they checked what was actually happening. That made the next decision easier to explain.',
    'They listened to the people involved before making a decision. It was important to understand the cause, not just the visible result.',
    'They compared the available options and considered what would happen next. A quick answer was tempting, but it could have made things worse.',
    'They tried to keep the plan simple. Everyone needed to understand the next step and who was responsible for it.'
  ];
  const prompts=[
    ['Where did this story take place?',1],
    ['What was the original plan?',2],
    ['What problem appeared?',3],
    ['What did the main character decide to do?',4],
    ['What happened in the end?',5],
    ['What did the main character learn?',6]
  ];
  const list=rows.map((r,i)=>{
    if(!Array.isArray(r)||r.length!==8)throw Error('Reader story must have eight fields in '+packId+' #'+(i+1));
    const [title,place,goal,problem,action,result,lesson,detail]=r;
    const person=names[i%names.length],day=days[i%days.length],cue=cues[i%cues.length],filler=fillers[i%fillers.length];
    let paragraphs;
    if(i%3===0){
      paragraphs=[
        `On ${day}, ${person} arrived at ${place}. The plan was to ${goal}. ${detail} They had made a short list of things to check, because missing a small detail could affect the whole day. At first, everything appeared to be going normally.`,
        `However, ${problem}. ${cue} ${person} stopped to consider whether the original plan would still work. Ignoring the issue seemed easier, but it would probably create more confusion later.`,
        `${person} decided to ${action}. ${filler} It took a little longer than expected, and they had to explain their decision to someone else. Still, the change gave them a clearer view of the situation.`,
        `Eventually, ${result}. The experience was not quite what ${person} had imagined, but it was useful. Looking back, ${person} realised that ${lesson}. They made a note of what had happened so that the next attempt would go more smoothly.`
      ];
    }else if(i%3===1){
      paragraphs=[
        `${person} had a specific task on ${day}: ${goal}. They went to ${place} and expected the process to be straightforward. ${detail} A few people were already waiting, so there was a good opportunity to observe how things normally worked.`,
        `Then the plan changed: ${problem}. ${person} noticed that different people understood the situation in different ways. ${cue} Before acting, they asked a few questions and checked what information could be trusted.`,
        `In the end, ${person} chose to ${action}. ${filler} The solution required some patience. Although there was pressure to move quickly, they preferred to make the next step clear to everyone.`,
        `The final result was that ${result}. ${person} felt relieved but also thought about what could be improved. The most important lesson was that ${lesson}. On the journey home, they wrote down a short reminder for next time.`
      ];
    }else{
      paragraphs=[
        `The week started with a plan to ${goal}. On ${day}, ${person} visited ${place} to put that plan into practice. ${detail} They were optimistic, although they knew that practical situations do not always follow a perfect timetable.`,
        `A complication appeared when ${problem}. It was not immediately obvious which option would work best. ${cue} ${person} asked for a moment to think and tried to separate facts from assumptions.`,
        `After discussing the options, ${person} decided to ${action}. ${filler} This choice was not the fastest, but it offered a reasonable way forward. It also gave other people enough information to cooperate.`,
        `By the end of the day, ${result}. The difficulty had been uncomfortable, yet it became a practical learning experience. ${person} concluded that ${lesson}. They planned to use the same approach if a similar situation happened again.`
      ];
    }
    const facts=[place,goal,problem,action,result,lesson];
    const questions=prompts.map(([q,factNo],j)=>{
      const k=factNo-1,first=facts[k],second=rows[(i+1)%rows.length][factNo],third=rows[(i+3)%rows.length][factNo];
      if(new Set([first,second,third]).size!==3)throw Error('Duplicate question options in '+packId+' #'+(i+1)+' Q'+(j+1));
      const correct=(i+j)%3;
      const options=correct===0?[first,second,third]:correct===1?[second,first,third]:[second,third,first];
      return {q,options,correct};
    });
    const words=paragraphs.join(' ').trim().split(/\s+/).length;
    return {id:packId+'-'+String(i+1).padStart(2,'0'),title,
      description:detail,
      minutes:Math.max(2,Math.ceil(words/125)),words,paragraphs,questions};
  });
  globalThis.NOMA_PACK_READERS[packId]=list;
  return list;
};
