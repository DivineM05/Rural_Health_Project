// Sources: ACEP "Is it an emergency?" warning signs; AHA stroke (F.A.S.T.) and heart attack warning signs.
export type EmergencyQuestion = {
  question: string;
  moreInformation: string;
};

export const emergencyQuestions: EmergencyQuestion[] = [
  {
    question: 'Are you choking, or unable to breathe?',
    moreInformation:
      'Choking means something is stuck in your throat. You may not be able to talk, cough, or breathe, and you may grab your throat.',
  },
  {
    question: 'Are you having trouble breathing or feel very short of breath?',
    moreInformation:
      'You cannot catch your breath, even when resting. You may breathe fast, wheeze, or be unable to say a full sentence. Your lips may look blue or gray.',
  },
  {
    question:
      'Do you have chest pain, pressure, or tightness? It may spread to your arm, jaw, neck, or back.',
    moreInformation:
      'It can feel like squeezing, heaviness, or fullness in the chest, and may come and go. You may also sweat, feel sick to your stomach, or be short of breath. Women may only feel tired, sick, or short of breath.',
  },
  {
    question:
      'Is one side of your face drooping, or is one arm or leg suddenly weak or numb?',
    moreInformation:
      'Smile in a mirror: does one side of your mouth hang lower? Raise both arms: does one drift down? These are stroke signs, even if they go away.',
  },
  {
    question: 'Are you suddenly having trouble speaking or understanding what people say?',
    moreInformation:
      'Your words may come out slurred or wrong, or you cannot find words. Try saying a simple sentence out loud. This can be a sign of a stroke.',
  },
  {
    question: 'Did you suddenly lose your sight, or is your vision suddenly blurry or double?',
    moreInformation:
      'This means a sudden change in one or both eyes, not slow changes over months. It can be a sign of a stroke.',
  },
  {
    question: 'Do you have a sudden, very bad headache, like the worst of your life?',
    moreInformation:
      'A headache that comes on in seconds or minutes and is much worse than any you have had before. It may come with a stiff neck, throwing up, or confusion.',
  },
  {
    question: 'Did you faint, or are you suddenly very dizzy or weak?',
    moreInformation:
      'Fainting means you passed out, even for a moment. Sudden dizziness means the room spins or you feel you will fall, and it does not go away when you sit or lie down.',
  },
  {
    question: 'Are you confused, or is it hard to stay awake?',
    moreInformation:
      'You do not know where you are, what day it is, or what is happening, or you keep falling asleep when you should be awake. Someone near you may notice this first.',
  },
  {
    question: 'Did you have a seizure?',
    moreInformation:
      'A seizure can be shaking you cannot control, staring and not answering, or passing out and jerking. You may not remember it, so ask anyone who was with you.',
  },
  {
    question: 'Are you bleeding a lot, and the bleeding will not stop?',
    moreInformation:
      'Blood keeps coming after 10 minutes of pressing hard on the wound, or blood is spurting or soaking through cloth.',
  },
  {
    question: 'Are you coughing up or throwing up blood?',
    moreInformation:
      'Blood may be bright red, or look like dark coffee grounds. Black, tar-like stool can also mean bleeding inside.',
  },
  {
    question:
      'Is your face, lips, tongue, or throat swelling, especially after food, a sting, or medicine?',
    moreInformation:
      'This can be a serious allergic reaction. You may also have hives, a tight throat, trouble swallowing, or trouble breathing.',
  },
  {
    question: 'Do you have sudden, very bad pain anywhere, such as in your belly?',
    moreInformation:
      'Pain that starts suddenly and is so strong you cannot move, sit still, or think about anything else. Belly pain that is hard to the touch is also a warning sign.',
  },
  {
    question: 'Have you been throwing up or had diarrhea that will not stop?',
    moreInformation:
      'You cannot keep any water down, or it has lasted more than a day. Signs of drying out are very little or dark urine, a dry mouth, and feeling dizzy when you stand.',
  },
  {
    question:
      'Did you have a serious injury, such as a bad fall, a hit to the head, a car crash, or a bad burn?',
    moreInformation:
      'Also count a bone that looks bent or is poking through skin, a deep cut, or a hit to the head followed by throwing up, confusion, or sleepiness.',
  },
  {
    question: 'Are you thinking about hurting yourself or someone else?',
    moreInformation:
      'This includes thinking about ending your life or making a plan to hurt someone. You are not alone. Tell someone you trust now and get help.',
  },
];
