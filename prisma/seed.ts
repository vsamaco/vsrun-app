import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.runProfile.upsert({
    where: {
      userId: "cljdfv2yx0000smvl6hsz37tx",
    },
    update: {},
    create: {
      userId: "cljdfv2yx0000smvl6hsz37tx",
      username: "milesperdonut",
      highlightRun: {
        id: "123",
        name: "Sample Run",
        distance: 100,
        moving_time: 200,
        total_elevation_gain: 300,
        start_latlng: [37.81, -122.26],
        summary_polyline:
          "mlweF|rfiV]o@eBoAwJgC`@yHf@iB`CwCfHeCrBNxEzB|AEhBsAVq@DeAUwBk@qAeAgA_FgCk@}@c@eBUyAAqJo@eAyBi@AoIm@mCmAaCF_@|AyBZAtBzA~MhE~DdBz@|At@zGv@hBlDnAtDfC~EBpA`@t@t@rAbDtArAR@r@i@~@dFbF}ErNmPXL`DxEdEfHaBjCmK~LyCdEcN~d@uE|Ps@fBa@P}FwBa@lCw@zA_@fBcBrEUlBwAxCoBdIFZr@HbE~BhA_Et@EvJtFfBb@vCdCfGbDN^m@rC}FzQeA~DUhB_ApBcArDgMz|@c@`Ao@\\cADuCs@qF{AK]nJ}r@jAyJ^iFhD}Lr@yDiB{Auj@wYcFgDByB|AiNHsCrAcF?e@eAW}AqAcHqDoBm@{@_AqBgA_FkBi@o@cF_DkJiEaKcGmE_BcFmDqPiJaEkAmGmEgKcFePeJSJDhMKVsAQSeAMiGMJJEISu@i@y@?wCu@DaGj@ErKlFzf@dXlMdGrAhAr_@pSfH`DxFpDzL`GfNpH^r@mAtFvBBbN`CxAp@dD\\~C|A^Sl@kDn@sAjEqP~CwJlCmLsCwBaEmBiFcDg@H_A`AgCxDaLhG{D_@wB{AsJcCDkBr@{Fh@oAhB_CtDuAtCk@xATpDlBjBDz@Wp@o@\\k@PgAIeB{@eCy@}@oE_CsAwBk@sCAuJs@iAyBe@P_GK_Bi@sBsAyBAY~A_CVGzB|AfSxGtAzBv@bHn@rA|D~A~CtBnFHfAXx@|@xAfDtAlAl@c@XBv@|EbAm@fSaVb@@t@`A~GvKXl@A\\iSlVwVlz@g@NaCmAqBc@kE~N[fD[B]zA}C~HArAnBl@jCzA`@_@x@aDhAR|NvHhAbAxGdDLZaOhh@uMr~@e@r@gARaLmCMm@jBkNr@{CC_@lGkf@f@aHnDiMr@sEqCmBwMwGwGaEaMiG}J{FGa@b@iDPyD|@_H@mAtA_GEWsAe@k@m@oD{A{CqBcCy@iAkAwHaDwGsEoHaDqL{GiDyA{LqHaLwF{CcAmDqByAqAeYgOwA{@]DIbANvKcBI_@oI}@q@gA?_@]oBWDcGLOv@RnL|F|f@bXhFnChBj@jJ|F`YhOrEzBhCp@p@|@dF`DfUpLfDr@D`Ac@bC}@pAZb@`BBjFrA~Fl@pCz@hCL`DpAb@s@l@uC|@{A`BeJrC_IvA_H|AgFX_CsMoHmAeAs@G{@t@qBxDmDnMc@dA",
      },
      weekStats: {
        weekMonth: "June",
        weekStartDate: "1",
        weekEndDate: "7",
        weekDistance: 100,
        weekDuration: 200,
        weekElevation: 300,
      },
      shoes: [
        {
          id: "456",
          brand_name: "Saucony",
          model_name: "Endorphin Pro 3",
          distance: 100,
        },
      ],
      events: [
        {
          name: "San Francisco Marathon",
          start_date: new Date(2023, 7, 23).toUTCString(),
          distance: 26.2,
        },
      ],
    },
  });
  console.log("after", profile);
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
