const Finance = require("../models/Finance");

exports.getFinanceSummary = async (req, res) =>{
    try{
        const userId = req.user.id;
        //se busca los movimientos de los usuarios
        const records = await Finance.find({owner: userId}).populate('clientId', 'name');

        //logica, se suma por categorias
        const summary = records.reduce((acc, curr)=>{
            if (curr.type === 'ingreso') acc.totalIncome += curr.amount;
            if (curr.type === 'gasto') acc.totalExpenses += curr.amount;
            return acc;
        }, {totalIncome: 0, totalExppense: 0});

        //el beneficio neto es simplemente los ingresos - gastos
        const netProfit = summary.totalIncome - summary.totalExpenses;

        res.json({
            summary,
            netProfit,
            records//envio la lista entera para la tabla del front
        });
    }catch(error){
        res.status(500).json({message:"Error al obtener resumen"});
    }
};

//funcion para añadir nuevo gasto o ingreso 
exports.addRecord = async (req, res) =>{
    try{
        const newRecord = new Finance({
            ...req.body,
            owner: req.user.id
        });
        await newRecord.save();
        res.status(201).json(newRecord);
    }catch(error){
        res.status(500).json({message:"Error al añadir "})
    }
};