import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  console.log("user:", user?.id);
  if (!user) return;

  const { id: userId } = user;

  await prisma.runProfile.upsert({
    where: {
      userId: userId,
    },
    update: {},
    create: {
      userId: userId,
      slug: "milesperdonut",
      name: "milesperdonut",
      highlightRun: {
        name: "Sample Run",
        start_date: new Date(2023, 5, 30).toUTCString(),
        distance: 42560.4,
        moving_time: 13614,
        total_elevation_gain: 173,
        start_latlng: [37.81, -122.26],
        summary_polyline:
          "mlweF|rfiV]o@eBoAwJgC`@yHf@iB`CwCfHeCrBNxEzB|AEhBsAVq@DeAUwBk@qAeAgA_FgCk@}@c@eBUyAAqJo@eAyBi@AoIm@mCmAaCF_@|AyBZAtBzA~MhE~DdBz@|At@zGv@hBlDnAtDfC~EBpA`@t@t@rAbDtArAR@r@i@~@dFbF}ErNmPXL`DxEdEfHaBjCmK~LyCdEcN~d@uE|Ps@fBa@P}FwBa@lCw@zA_@fBcBrEUlBwAxCoBdIFZr@HbE~BhA_Et@EvJtFfBb@vCdCfGbDN^m@rC}FzQeA~DUhB_ApBcArDgMz|@c@`Ao@\\cADuCs@qF{AK]nJ}r@jAyJ^iFhD}Lr@yDiB{Auj@wYcFgDByB|AiNHsCrAcF?e@eAW}AqAcHqDoBm@{@_AqBgA_FkBi@o@cF_DkJiEaKcGmE_BcFmDqPiJaEkAmGmEgKcFePeJSJDhMKVsAQSeAMiGMJJEISu@i@y@?wCu@DaGj@ErKlFzf@dXlMdGrAhAr_@pSfH`DxFpDzL`GfNpH^r@mAtFvBBbN`CxAp@dD\\~C|A^Sl@kDn@sAjEqP~CwJlCmLsCwBaEmBiFcDg@H_A`AgCxDaLhG{D_@wB{AsJcCDkBr@{Fh@oAhB_CtDuAtCk@xATpDlBjBDz@Wp@o@\\k@PgAIeB{@eCy@}@oE_CsAwBk@sCAuJs@iAyBe@P_GK_Bi@sBsAyBAY~A_CVGzB|AfSxGtAzBv@bHn@rA|D~A~CtBnFHfAXx@|@xAfDtAlAl@c@XBv@|EbAm@fSaVb@@t@`A~GvKXl@A\\iSlVwVlz@g@NaCmAqBc@kE~N[fD[B]zA}C~HArAnBl@jCzA`@_@x@aDhAR|NvHhAbAxGdDLZaOhh@uMr~@e@r@gARaLmCMm@jBkNr@{CC_@lGkf@f@aHnDiMr@sEqCmBwMwGwGaEaMiG}J{FGa@b@iDPyD|@_H@mAtA_GEWsAe@k@m@oD{A{CqBcCy@iAkAwHaDwGsEoHaDqL{GiDyA{LqHaLwF{CcAmDqByAqAeYgOwA{@]DIbANvKcBI_@oI}@q@gA?_@]oBWDcGLOv@RnL|F|f@bXhFnChBj@jJ|F`YhOrEzBhCp@p@|@dF`DfUpLfDr@D`Ac@bC}@pAZb@`BBjFrA~Fl@pCz@hCL`DpAb@s@l@uC|@{A`BeJrC_IvA_H|AgFX_CsMoHmAeAs@G{@t@qBxDmDnMc@dA",
      },
      weekStats: {
        start_date: new Date(2023, 5, 29).toUTCString(),
        end_date: new Date(2023, 6, 4).toUTCString(),
        total_runs: 5,
        total_distance: 64373,
        total_duration: 18000,
        total_elevation: 1000,
      },
      shoes: [
        {
          brand_name: "Saucony",
          model_name: "Ride 15",
          distance: 82803,
          categories: ["daily_trainer"],
        },
        {
          brand_name: "New Balance",
          model_name: "Rebel v3",
          distance: 160934,
          categories: ["tempo"],
        },
        {
          brand_name: "Adidas",
          model_name: "Adizero Pro 3",
          distance: 80467,
          categories: ["race"],
        },
      ],
      events: [
        {
          name: "Oakland Marathon",
          start_date: new Date(2023, 2, 19).toUTCString(),
          distance: 42195,
          moving_time: 13057,
        },
        {
          name: "San Francisco Marathon",
          start_date: new Date(2023, 6, 23).toUTCString(),
          distance: 42195,
          moving_time: 13057,
        },
        {
          name: "Chicago Marathon",
          start_date: new Date(2023, 9, 8).toUTCString(),
          distance: 42195,
          moving_time: 13057,
        },
      ],
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
