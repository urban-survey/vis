function create_panel(allScores, optionsObject, wizard_panel_select){

  tooltipDict={
    size:'Small: <100 nodes  Medium: <1000 nodes Large: >1000 nodes',
    // type:'Small: <100 nodes  Medium: <1000 nodes Large: >1000 nodes',
    node_attr_size:'few attributes: <5  several attributes: >5',
    node_attr_type:'homogeneous: 1 type heterogeneous: >1 type',
    edge_attr_size:'few attributes: <3  several attributes: >3',
    edge_attr_type:'homogeneous: 1 type heterogeneous: >1 type',
    structure:'CLUSTER: a set of well connected nodes, such as a community in social networks. NETWORK: the entire network or a subset that is not limited to a specific structure'
  }

  let groups = d3.select(wizard_panel_select).selectAll('div').data(Object.keys(optionsObject));

  let groupsEnter = groups.enter().append('div').attr('class','dataDiv');

  //Add Header
  let h4 = groupsEnter.append('h4');

  h4.append('span').attr('id','header');
  h4
  .filter(d=>tooltipDict[d])
  .append('span')
  .attr('id','icon')
  .append('i');

  let switchEl = h4.append('span').attr('class','field is-pulled-right');

  switchEl.append('input')
  .attr('type','checkbox')
  .attr('class','switch is-info is-small');

  switchEl.append('label');

  //Add options
  groupsEnter.append('div').attr('class','tabs is-fullwidth is-toggle'); 

  let ul = groupsEnter.select('.tabs')
  .append('ul');

  groups = groupsEnter.merge(groups);

  //Set data dependent attributes

  groups
  .attr('class',d=>'dataDiv data_' + d);

  groups.select('.switch')
  .attr('id',d=>'switch_'+d);

  groups.select('label')
  .attr('for',d=>'switch_'+d);

  groups.select('#header')
  .text(d=>optionsObject[d].label);

  groups.select('#icon')
  .attr('class','icon tooltip is-tooltip-multiline')
  .attr('data-tooltip',d=>tooltipDict[d]);

  groups.select('i')
  .attr('class','fas fa-question-circle has-text-grey');

  let li = groups.select('ul').selectAll('li').data((d)=>optionsObject[d].options.map(option=>{return {category:d,option}}));

  let liEnter = li.enter().append('li');

  liEnter.append('a').append('span');

  li = liEnter.merge(li);

  li.attr('class',d=> d.category +  ' ' + d.option);

  li.select('span').text(d=>d.option);

  li.on('click',function(d){
  
    let tabGroup = d3.select((this.parentNode).parentNode);
    let category = tabGroup.data()[0];

    // console.log('clicked', d);
    let isSelected = d3.select(this).classed('is-active');

    // if (category !== 'structure'){
    //   tabGroup.selectAll('li').classed('is-active',false);
    // }
    d3.select(this).classed('is-active',!isSelected);

    //if no elements are selected, set toggle to false;
    selectedTabs = tabGroup.selectAll('.is-active');

    d3.select('#switch_' + category)
    .property('checked',selectedTabs.empty()? false : true);

    compute_scores(allScores);

    //highlight all mini panel buttons for active tabs. 
    selectedTabs = d3.select(wizard_panel_select).selectAll('.is-active').each(function(tab){
      let currentClass = d3.select(this).attr('class').replace('is-active','').trim();
      let miniButtons = d3.selectAll('.button').filter(function(b){
          return d3.select(this).attr('class').includes(currentClass);
      }).classed('is-focused',true);
    })

  });

  d3.selectAll(".switch").on("change", function(d){

    let tabGroup = d3.select(((this.parentNode).parentNode).parentNode).select('.tabs');
    let category = tabGroup.data()[0];

    d3.select(this).property('checked',false); //for now disable turning the toggle on;

    tabGroup.selectAll('li')
    .classed('is-active',false);

    compute_scores(allScores);

    //highlight all mini panel buttons for active tabs. 
    selectedTabs = d3.select(wizard_panel_select).selectAll('.is-active').each(function(tab){
      let currentClass = d3.select(this).attr('class').replace('is-active','').trim();
      let miniButtons = d3.selectAll('.button').filter(function(b){
          return d3.select(this).attr('class').includes(currentClass);
      }).classed('is-focused',true);
    })

  });

  compute_scores(allScores);
}

function create_mini_panel(techniques,allScores){

  let score2class = {
    "1": "score-one",
    "2": "score-two",
    "3": "score-three",
    "0": "score-zero"
  };

  
  let cards = d3.selectAll('.techniqueCard').data(techniques.map(t=>t[0]));

  let groups = cards.select('#mini_wizard_panel').selectAll('div').data(d=>Object.keys(optionsObject).map(k=>{return {'technique':d,'dimension':k}}));

  let groupsEnter = groups.enter().append('div');

  //Add Header
  let h4 = groupsEnter.append('h6');

  h4.append('span').attr('id','header');

  groups = groupsEnter.merge(groups);

  //Set data dependent attributes

  groups.select('#header')
  .text(d=>optionsObject[d.dimension].shortLabel ? optionsObject[d.dimension].shortLabel : optionsObject[d.dimension].label);


  let li = groups.selectAll('a').data((d)=>optionsObject[d.dimension].options.map(
  option=>{return {category:d.dimension,option,technique:d.technique}}));

  let liEnter = li.enter().append('a');

  liEnter.append('a').append('span');

  li = liEnter.merge(li);

  li.attr('class',d=>{
    let score = allScores[d.technique][d.category][d.option];
    return d.category +  ' ' + d.option + ' ' + score2class[score] + ' button tooltip';
  })
  .attr('data-tooltip',d=>d.option);


  li.text(d=>{
    let score = allScores[d.technique][d.category][d.option];
    return score;
  });
}

function compute_scores(allScores){

  d3.select('#recommendations').style('visibility','visible');

  //create a list of key/value pairs to use in the scores
  let activeOptions = d3.selectAll('.is-active').data(); 
  
  // let num2strMap = {
  //   "1": "ones",
  //   "2": "twos",
  //   "3": "threes",
  //   "0": "zeros"
  // };

  // Object.keys(allScores).map(technique => {
  //   allScores[technique].totalScore = 0;
  //   allScores[technique].threes=[];
  //   allScores[technique].twos=[];
  //   allScores[technique].ones=[];
  //   allScores[technique].zeros=[];

  //   activeOptions.map(option=>{
  //     let score = allScores[technique][option.category][option.option];
  //     // console.log(technique,option.category,option.option,score);
  //     allScores[technique].totalScore = allScores[technique].totalScore + score;
  //     allScores[technique][num2strMap[score]].push([option.category,option.option]);
  //   });
  //    let score = activeOptions.length > 0 ? allScores[technique].totalScore / activeOptions.length : allScores[technique].totalScore;
  //    allScores[technique].averageScore = Math.round( score * 10) / 10
  // });

  activeOptionsArray = [];

  activeOptions.map(elem => {

    switch(elem.option) {
      case "System":
        activeOptionsArray.push("system_type");
        break;
      case "Technique":
        activeOptionsArray.push("technique");
        break;
      case "Design study":
        activeOptionsArray.push("design_study");
        break;
      case "Evaluation":
        activeOptionsArray.push("evaluation");
        break;
      case "Data":
        activeOptionsArray.push("data");
        break;
      case "Analysis":
        activeOptionsArray.push("analysis");
        break;
      case "Sunlight access":
        activeOptionsArray.push("sunlight_access");
        break;
      case "Wind":
        activeOptionsArray.push("wind_ventilation");
        break;
      case "View impact":
        activeOptionsArray.push("view_impact");
        break;
      case "Energy":
        activeOptionsArray.push("energy");
        break;
      case "Disaster mgmt":
        activeOptionsArray.push("damage_and_disaster_management");
        break;
      case "Climate":
        activeOptionsArray.push("climate");
        break;
      case "Noise":
        activeOptionsArray.push("sound");
        break;
      case "Property Cadastre":
        activeOptionsArray.push("property_cadastre");
        break;
      case "Other use":
        activeOptionsArray.push("other_use");
        break;
      case "Lookup":
        activeOptionsArray.push("lookup");
        break;
      case "Browse":
        activeOptionsArray.push("browse");
        break;
      case "Locate":
        activeOptionsArray.push("locate");
        break;
      case "Explore":
        activeOptionsArray.push("explore");
        break;
      case "Identify":
        activeOptionsArray.push("identify");
        break;
      case "Compare":
        activeOptionsArray.push("compare");
        break;
      case "Summarize":
        activeOptionsArray.push("summarize");
        break;
      case "Distribution":
        activeOptionsArray.push("distribution");
        break;
      case "Trends":
        activeOptionsArray.push("trends");
        break;
      case "Outliers":
        activeOptionsArray.push("outliers");
        break;
      case "Extremes":
        activeOptionsArray.push("extremes");
        break;
      case "Features":
        activeOptionsArray.push("features");
        break;
      case "Target Discovery":
        activeOptionsArray.push("target_discovery");
        break;
      case "Target Access":
        activeOptionsArray.push("target_access");
        break;
      case "Spatial relationship":
        activeOptionsArray.push("spatial_relation");
        break;
      case "Buildings":
        activeOptionsArray.push("buildings");
        break;
      case "Streets":
        activeOptionsArray.push("streets");
        break;
      case "Nature":
        activeOptionsArray.push("nature");
        break;
      case "Uniform":
        activeOptionsArray.push("uniform_discretization");
        break;
      case "Semantic":
        activeOptionsArray.push("structural_subdivision");
        break;
      case "Univariate":
        activeOptionsArray.push("univariate");
        break;
      case "Multivariate":
        activeOptionsArray.push("multivariate");
        break;
      case "Volumetric":
        activeOptionsArray.push("volumetric");
        break;
      case "Temporal":
        activeOptionsArray.push("temporal");
        break;
      case "Sensing":
        activeOptionsArray.push("sensing");
        break;
      case "Statistical":
        activeOptionsArray.push("statistical");
        break;
      case "Simulation":
        activeOptionsArray.push("simulation_based");
        break;
      case "Learning":
        activeOptionsArray.push("learning_based");
        break;
      case "Surveyed":
        activeOptionsArray.push("surveyed");
        break;
      case "Micro":
        activeOptionsArray.push("micro");
        break;
      case "Meso":
        activeOptionsArray.push("multi_block");
        break;
      case "Macro":
        activeOptionsArray.push("city");
        break;
      case "VA w/o models":
        activeOptionsArray.push("va_wo_model");
        break;
      case "Post-model VA":
        activeOptionsArray.push("post_model");
        break;
      case "Model integrated VA":
        activeOptionsArray.push("model_integrated");
        break;
      case "VA-assisted model":
        activeOptionsArray.push("assisted_models");
        break;
      case "Overlay":
        activeOptionsArray.push("overlay");
        break;
      case "Embedded view":
        activeOptionsArray.push("embedded");
        break;
      case "Linked view":
        activeOptionsArray.push("linked");
        break;
      case "Animation":
        activeOptionsArray.push("temporal_jx");
        break;
      case "Spatial jx":
        activeOptionsArray.push("spatial_jx");
        break;
      case "Filter":
        activeOptionsArray.push("filter");
        break;
      case "Aggregate":
        activeOptionsArray.push("aggregate");
        break;
      case "Embed":
        activeOptionsArray.push("embed");
        break;
      case "Glyphs / streamlines":
        activeOptionsArray.push("glyphs");
        break;
      case "Bar charts":
        activeOptionsArray.push("bar_charts");
        break;
      case "Scatterplots":
        activeOptionsArray.push("scatterplots");
        break;
      case "Linegraphs":
        activeOptionsArray.push("linegraphs");
        break;
      case "Matrix":
        activeOptionsArray.push("matrix");
        break;
      case "Grid":
        activeOptionsArray.push("grid");
        break;
      case "BoxPlot":
        activeOptionsArray.push("boxplot");
        break;
      case "Parallel coord.":
        activeOptionsArray.push("parallel_coordinates");
        break;
      case "2D map":
        activeOptionsArray.push("map_2d");
        break;
      case "3D map":
        activeOptionsArray.push("map_3d");
        break;
      case "Distortion":
        activeOptionsArray.push("distortion");
        break;
      case "Ghosting":
        activeOptionsArray.push("ghosting");
        break;
      case "Culling":
        activeOptionsArray.push("culling");
        break;
      case "Birds view":
        activeOptionsArray.push("birds_view");
        break;
      case "Multi-view":
        activeOptionsArray.push("multi_view");
        break;
      case "Assisted Steering":
        activeOptionsArray.push("assisted_steering");
        break;
      case "Other":
        activeOptionsArray.push("other");
        break;
      case "VR/Cave":
        activeOptionsArray.push("vr_cave");
        break;
      case "AR":
        activeOptionsArray.push("ar");
        break;
      case "Desktop":
        activeOptionsArray.push("desktop");
        break;
      case "Mobile":
        activeOptionsArray.push("mobile");
        break;
      case "Walking":
        activeOptionsArray.push("walking");
        break;
      case "Steering":
        activeOptionsArray.push("steering");
        break;
      case "Case Study":
        activeOptionsArray.push("case_study");
        break;
      case "User Study":
        activeOptionsArray.push("user_study");
        break;
      case "Statistical Evaluation":
        activeOptionsArray.push("statistical_evaluation");
        break;
      case "Expert Interviews":
        activeOptionsArray.push("expert_interviews");
        break;
      case "Selection":
        activeOptionsArray.push("selection_based");
        break;
      case "Manipulation":
        activeOptionsArray.push("manipulation_based");
        break;   
    }

  });

  let filteredScores = [];

  for(const keyScore of Object.keys(allScores)){

    let score = allScores[keyScore];

    let includeScore = true;

    for(const key of Object.keys(score.tags)){

      if(activeOptionsArray.includes(key) && score.tags[key] === "False"){
        includeScore = false;
      }
    }

    if(includeScore && keyScore != ""){
      filteredScores.push(keyScore);
    }
  }

  render_techniques(allScores, filteredScores);
}

function render_techniques(info, filteredScores) {

  let techniques = Object.keys(info).map(key=>{
    return [key]
  });

  let color = d3.scaleLinear().domain([0,1,2,3])
    .range(['#f3a685','#cccccc','#92c5de','#1773af']);

   let cards = d3.selectAll('.techniqueCard').data(techniques);

  //  cards.select('.rec').select('h4').select('.techniqueTitle').html(d=>'<a href="' + info[d[0]].doi + '">' + info[d[0]].title + '</a>');
   
  cards.select('.rec').select('h4').select('.techniqueTitle').html(d=>'<a href="' + info[d[0]].baseUrl + info[d[0]].url + '">' + info[d[0]].title + '</a>');

  if(filteredScores != undefined){
    cards.style('display', d => filteredScores.includes(d[0]) ? 'block' : 'none');
  }

  // cards.select('img').property('src',d=>'/vis/assets/images/techniques/icons/' + info[d[0]].image);

  // cards.select('.moreLink').html(d=>'<a href="' + info[d[0]].baseUrl + info[d[0]].url + '"> More... </a>');

  //  cards.select('.techniqueDescription').text(d=>info[d[0]].description)

   //only show this for techniques that actually have a 0 score.
  //  cards.select('.scoreZero')
  //   .style('display',d=> info[d[0]].bad.length === 0 ?  'none' : 'block');
  
  //  create_mini_panel(techniques,info);

  d3.select('#recommendations').style('visibility','visible');

}


