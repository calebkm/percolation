get '/' do
  erb :index, layout: :layout
end

post '/' do
  Simulation.create(params)

  status 200
end